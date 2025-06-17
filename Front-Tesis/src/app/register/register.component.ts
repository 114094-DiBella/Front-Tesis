import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Listener para mensajes del popup de términos
  private messageListener = (event: MessageEvent) => {
    // Verificar que el mensaje venga del origen correcto
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'TERMS_ACCEPTED' && event.data.accepted) {
      // Marcar el checkbox de términos como aceptado
      this.registerForm.patchValue({ terms: true });
      console.log('Términos aceptados desde popup');
    }
  };

  ngOnInit() {
    // Escuchar mensajes del popup de términos
    window.addEventListener('message', this.messageListener);
  }

  ngOnDestroy() {
    // Limpiar el listener
    window.removeEventListener('message', this.messageListener);
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  registerForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    phone: ['', Validators.required],
    numberDocument: ['', Validators.required],
    birthday: [null, Validators.required],
    terms: [false, Validators.requiredTrue]
  }, { validators: this.passwordMatchValidator });
  
  errorMessage: string = '';

  close() {
    this.router.navigate(['/login']);
  }

  createUser() {
    console.log('Form submitted:', this.registerForm);
    console.log('Form status:', this.registerForm.status);
    console.log('Form valid?', this.registerForm.valid);
    console.log('Form values:', this.registerForm.value);
    
    if (this.registerForm.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      
      if (this.registerForm.hasError('passwordMismatch')) {
        this.errorMessage = 'Las contraseñas no coinciden';
      } else {
        this.errorMessage = 'Por favor completa todos los campos requeridos correctamente';
      }
      return;
    }
  
    try {
      const user = new User({
        firstName: this.registerForm.value.name ?? '',
        lastName: this.registerForm.value.lastName ?? '',
        email: this.registerForm.value.email ?? '',
        password: this.registerForm.value.password ?? '',
        telephone: this.registerForm.value.phone ? Number(this.registerForm.value.phone) : 0,
        numberDoc: this.registerForm.value.numberDocument ? Number(this.registerForm.value.numberDocument) : 0,
        birthday: this.registerForm.value.birthday ? new Date(this.registerForm.value.birthday) : new Date()
      });

      console.log('User to create:', user);
    
      this.authService.createUser(user).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = 'Error al crear usuario: ' + (error.message || error.error?.message || 'Error desconocido');
        }
      });
    } catch (error: any) {
      console.error('Exception during user creation:', error);
      this.errorMessage = 'Error al procesar el formulario: ' + (error.message || 'Error desconocido');
    }
  }

  openTerms() {
    window.open('/terminos', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
  }

  // Solo permite letras básicas y espacios (SIN acentos ni ñ)
  allowOnlyLetters(event: any) {
    const value = event.target.value;
    const filtered = value.replace(/[^a-zA-Z\s]/g, ''); // Sin acentos ni ñ
    
    if (value !== filtered) {
      event.target.value = filtered;
      this.updateFormControl(event.target.id, filtered);
    }
  }

  // Solo permite números
  allowOnlyNumbers(event: any) {
    const value = event.target.value;
    const filtered = value.replace(/[^0-9]/g, '');
    
    if (value !== filtered) {
      event.target.value = filtered;
      this.updateFormControl(event.target.id, filtered);
    }
  }

  // Permite números, espacios, guiones, paréntesis y +
  allowPhoneChars(event: any) {
    const value = event.target.value;
    const filtered = value.replace(/[^0-9\s\-\(\)\+]/g, '');
    
    if (value !== filtered) {
      event.target.value = filtered;
      this.updateFormControl(event.target.id, filtered);
    }
  }

  // Previene teclas no permitidas
  onKeyPress(event: KeyboardEvent, type: string) {
    const char = event.key;
    
    if (type === 'numbers') {
      if (!/[0-9]/.test(char) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(char)) {
        event.preventDefault();
      }
    }
  }

  // Maneja el pegado de contenido
  onPaste(event: ClipboardEvent, type: string) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    let filtered = '';
    
    switch(type) {
      case 'letters':
        filtered = clipboardData.replace(/[^a-zA-Z\s]/g, ''); // Sin acentos ni ñ
        break;
      case 'numbers':
        filtered = clipboardData.replace(/[^0-9]/g, '');
        break;
      case 'phone':
        filtered = clipboardData.replace(/[^0-9\s\-\(\)\+]/g, '');
        break;
    }
    
    const target = event.target as HTMLInputElement;
    target.value = filtered;
    this.updateFormControl(target.id, filtered);
  }

    private updateFormControl(fieldId: string, value: string) {
      const fieldMap: { [key: string]: string } = {
        'name': 'name',
        'lastName': 'lastName', 
        'email': 'email',
        'password': 'password',
        'confirmPassword': 'confirmPassword',
        'phone': 'phone',
        'numberDocument': 'numberDocument',
        'birthday': 'birthday',
        'terms': 'terms'
      };
      
      const controlName = fieldMap[fieldId];
      if (controlName) {
        (this.registerForm.controls as any)[controlName]?.setValue(value);
      }
    }
}