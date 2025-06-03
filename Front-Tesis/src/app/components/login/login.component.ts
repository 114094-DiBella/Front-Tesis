import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // Añadir standalone: true
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Añadir los imports necesarios
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  
  users: User[] = [];

  // Usa una sola forma de inyección de dependencias
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  loading = signal(false);
  errorMessage = signal('');
  
  loginForm: FormGroup;

  constructor() {
    // Inicializar el formulario en el constructor
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si quieres cargar los usuarios al iniciar el componente
    // this.getAllUsers();
  }

  getAllUsers() {
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response;
        console.log('Usuarios obtenidos:', this.users);
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading.set(true);
    this.errorMessage.set('');
    
    console.log('Formulario de inicio de sesión:', this.loginForm.value);
    const user = new User({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    });
    
    this.authService.login(user).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        
        // ✅ NUEVO - Guardar datos del usuario en localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userEmail', user.email || '');
          // Si el backend devuelve rol, guardarlo también
          localStorage.setItem('userRole', response.role || 'USER');
        }
        
        // Redirigir a la tienda
        this.router.navigate(['/store']);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.errorMessage.set('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  createUser() {
    this.router.navigate(['/register']);
  }
}