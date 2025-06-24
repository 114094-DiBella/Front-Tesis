import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  loading = signal(false);
  emailSent = signal(false);
  errorMessage = signal('');

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    
    const email = this.forgotPasswordForm.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        console.log('Correo de recuperación enviado:', response);
        this.emailSent.set(true);
        this.toastr.success(
          'Se ha enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.',
          'Correo enviado',
          { timeOut: 8000 }
        );
      },
      error: (error) => {
        console.error('Error al enviar correo de recuperación:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 404) {
          this.errorMessage.set('No se encontró una cuenta con este correo electrónico.');
        } else if (error.status === 429) {
          this.errorMessage.set('Demasiadas solicitudes. Por favor, espera unos minutos antes de intentar de nuevo.');
        } else {
          this.errorMessage.set('Error al enviar el correo. Por favor, inténtalo de nuevo más tarde.');
        }
        
        this.loading.set(false);
      }
    });
  }

  resendEmail() {
    this.emailSent.set(false);
    this.onSubmit();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched() {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      this.forgotPasswordForm.get(key)?.markAsTouched();
    });
  }

  // Getters para facilitar el acceso en el template
  get email() {
    return this.forgotPasswordForm.get('email');
  }

  get isEmailInvalid() {
    return this.email?.invalid && (this.email?.dirty || this.email?.touched);
  }
}