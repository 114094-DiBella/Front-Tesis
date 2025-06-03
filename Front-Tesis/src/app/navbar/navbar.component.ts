// navbar.component.ts - ACTUALIZADO CON MANEJO DE PERFIL
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService, CartSummary } from '../services/cart.service';
import { AuthService } from '../services/auth.service'; // ✅ NUEVO

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
  userEmail: string = '';
  userId: string = ''; // ✅ NUEVO - ID del usuario
  isAdmin: boolean = false;
  
  // Estado del carrito
  cartItemCount: number = 0;
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService // ✅ NUEVO
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
    const userId = localStorage.getItem('userId'); // ✅ NUEVO
    const userRole = localStorage.getItem('userRole');
    
    this.isLoggedIn = !!token;
    this.userEmail = userEmail || '';
    this.userId = userId || ''; // ✅ NUEVO
    this.isAdmin = userRole === 'ADMIN';
  }

  // ✅ CORREGIDO - Ir al perfil con ID real del usuario
  goToProfile(): void {
    if (this.isLoggedIn) {
      if (this.userId) {
        // Si tenemos el ID guardado, ir directo a editar
        this.router.navigate(['/users/edit', this.userId]);
      } else {
        // Si no tenemos el ID, buscarlo por email
        this.getUserIdByEmail();
      }
    } else {
      // Si no está logueado, ir al login
      this.router.navigate(['/login']);
    }
  }

  // ✅ NUEVO - Obtener ID del usuario por email
  private getUserIdByEmail(): void {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      console.error('No hay email de usuario guardado');
      this.router.navigate(['/login']);
      return;
    }

    // Buscar el usuario por email para obtener su ID
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        const currentUser = users.find(user => user.email === userEmail);
        if (currentUser && currentUser.id) {
          // Guardar el ID para futuras referencias
          localStorage.setItem('userId', currentUser.id);
          this.userId = currentUser.id;
          
          // Navegar a editar perfil
          this.router.navigate(['/users/edit', currentUser.id]);
        } else {
          console.error('Usuario no encontrado');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Error al buscar usuario:', error);
        this.router.navigate(['/login']);
      }
    });
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
    localStorage.removeItem('userId'); // ✅ NUEVO
    localStorage.removeItem('userRole');
    
    // Limpiar carrito
    this.cartService.clearCart();
    
    // Actualizar estado
    this.isLoggedIn = false;
    this.userEmail = '';
    this.userId = ''; // ✅ NUEVO
    this.isAdmin = false;
    
    // Redirigir al store
    this.router.navigate(['/store']);
  }
}