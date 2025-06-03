import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuario logueado, permitir acceso
      return true;
    } else {
      // Usuario no logueado, redirigir al login
      this.router.navigate(['/login']);
      return false;
    }
  }
}