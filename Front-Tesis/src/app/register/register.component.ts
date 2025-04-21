import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

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
    birthday: [null, Validators.required]
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
}