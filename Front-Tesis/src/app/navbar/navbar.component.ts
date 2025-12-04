// navbar.component.ts - AGREGAR ESTO
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService, CartSummary } from '../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  
  // Estado de autenticación
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  isAdmin: boolean = false;
  
  // Estado del carrito
  cartItemCount: number = 0;
  
  // ✅ NUEVO - Estado del menú desplegable
  isAdminMenuOpen: boolean = false;
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary: CartSummary) => {
        this.cartItemCount = summary.itemCount;
      });
    
    // Verificar estado de login al iniciar
    this.checkLoginStatus();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Verificar si el usuario está logueado
  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    this.isLoggedIn = !!token;
    this.userName = userName || '';
    this.userEmail = userEmail || '';
    this.userId = userId || '';
    this.isAdmin = userRole === 'ADMIN';
  }

  // ✅ NUEVO - Toggle menú admin
  toggleAdminMenu(): void {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
  }

  // Ir al perfil
  goToProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/users/edit', this.userId]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Ir al carrito (protegido)
  goToCart(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/orders/new']);
    } else {
      alert('Debes iniciar sesión para acceder al carrito');
      this.router.navigate(['/login']);
    }
  }

  // Logout mejorado
  logout(): void {
    console.log('Cerrando sesión...');
    
    // Limpiar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Limpiar carrito
    this.cartService.clearCart();
    
    // Actualizar estado
    this.isLoggedIn = false;
    this.userEmail = '';
    this.userId = '';
    this.isAdmin = false;
    this.isAdminMenuOpen = false; // ✅ Cerrar menú al logout
    
    // Redirigir al store
    this.router.navigate(['/store']);
  }
}