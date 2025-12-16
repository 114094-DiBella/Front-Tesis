// navbar.component.ts - AGREGAR ESTO
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
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
  private closeMenuTimer: any = null;
  @ViewChild('adminDropdown') adminDropdown?: ElementRef;
  
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

    // Cerrar el menú admin cuando se navega a otra ruta
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => this.closeAdminMenu());
  }

  // ✅ NUEVO - Toggle menú admin
  toggleAdminMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.isAdminMenuOpen = !this.isAdminMenuOpen;

    if (this.isAdminMenuOpen) {
      this.clearCloseTimer();
      this.closeMenuTimer = setTimeout(() => this.closeAdminMenu(), 5000);
    } else {
      this.clearCloseTimer();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isAdminMenuOpen) return;
    if (this.adminDropdown && this.adminDropdown.nativeElement.contains(event.target)) {
      return; // Click dentro del dropdown -> no cerrar
    }
    this.closeAdminMenu();
  }

  // Cerrar el menú admin
  closeAdminMenu(): void {
    this.isAdminMenuOpen = false;
    this.clearCloseTimer();
  }

  private clearCloseTimer(): void {
    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }
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


  // Ir al perfil
  goToProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/users/edit', this.userId]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Ir al carrito: abrir previsualización en drawer (no navegación inmediata)
  goToCart(): void {
    // Abrir/alternar la previsualización del carrito
    this.cartService.togglePreview();
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