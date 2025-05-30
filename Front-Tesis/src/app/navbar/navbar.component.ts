// navbar.component.ts - ACTUALIZADO
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  user: any = null;
  isAdmin: boolean = true;
  isLoggedIn: boolean = false;
  isUser: boolean = false;
  isStore: boolean = false;
  
  // ✅ NUEVO - Estado del carrito
  cartItemCount: number = 0;
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService // ✅ NUEVO servicio
  ) {}

  ngOnInit(): void {
    // ✅ NUEVO - Suscribirse al carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary: CartSummary) => {
        this.cartItemCount = summary.itemCount;
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    console.log('Cerrando sesión...');
    // También limpiar carrito al cerrar sesión si quieres
    // this.cartService.clearCart();
  }
}