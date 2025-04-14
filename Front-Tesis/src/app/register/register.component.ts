import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

  registerForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    phone: ['', Validators.required],
    numberDocument: ['', Validators.required],
    birthday: [new Date, Validators.required]
  });
  
  errorMessage: string = '';

  close() {
    this.router.navigate(['/login']);
  }

  createUser() {
    if (this.registerForm.invalid) {
      return;
    }
  
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
  
    const user = new User({
      firstName: this.registerForm.value.name ?? '',
      lastName: this.registerForm.value.lastName ?? '',
      email: this.registerForm.value.email ?? '',
      password: this.registerForm.value.password ?? '',
      telephone: Number(this.registerForm.value.phone) ?? 0,
      numberDoc: Number(this.registerForm.value.numberDocument) ?? 0,
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
        this.errorMessage = 'Error al crear usuario: ' + (error.message || 'Error desconocido');
      }
    });
  }

  private formatDateForBackend(date: Date | string | null | undefined): string {
    if (!date) {
      return '';
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Formato ISO 8601 que es compatible con LocalDateTime
    // Ejemplo: "2025-04-13T14:30:00"
    return dateObj.toISOString().slice(0, 19);
  }
}