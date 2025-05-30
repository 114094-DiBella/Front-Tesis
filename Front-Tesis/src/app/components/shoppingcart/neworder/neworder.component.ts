// neworder.component.ts - CORREGIDO PARA USAR CHECKOUT
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CheckoutService } from '../../../services/checkout.service'; // ✅ CAMBIO: Usar CheckoutService
import { CartService, CartItem, CartSummary } from '../../../services/cart.service';
import { PaymentService } from '../../../services/payment.service';
import { PaymentMethod } from '../../../models/payment.models';

@Component({
  selector: 'app-neworder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './neworder.component.html',
  styleUrl: './neworder.component.css'
})
export class NeworderComponent implements OnInit, OnDestroy {
  // Datos del carrito
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  };
  
  // Métodos de pago
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: PaymentMethod | null = null;
  checkoutForm: FormGroup;
  
  // Estados de la UI
  isLoading: boolean = false;
  processingCheckout: boolean = false;
  loadingPaymentMethods: boolean = false;
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Datos temporales (en una app real vendrían del usuario logueado)
  private readonly TEMP_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

  constructor(
    private checkoutService: CheckoutService, // ✅ CAMBIO: Usar CheckoutService
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder 
  ) {
    this.checkoutForm = this.fb.group({
      paymentMethodId: ['']
    });
  }

  ngOnInit(): void {
    this.subscribeToCart();
    this.loadPaymentMethods();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Suscribirse a los cambios del carrito
  private subscribeToCart(): void {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        console.log('📦 Items del carrito actualizados:', items);
      });
    
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
        console.log('💰 Resumen del carrito actualizado:', summary);
      });
  }
  
  // Cargar métodos de pago
  private loadPaymentMethods(): void {
    this.loadingPaymentMethods = true;
    
    this.paymentService.getActivePaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
        console.log('💳 Métodos de pago cargados:', methods);
        
        // Si solo hay un método, seleccionarlo automáticamente
        if (methods.length === 1) {
          this.selectPaymentMethod(methods[0]);
        }
        
        this.loadingPaymentMethods = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar métodos de pago:', error);
        this.loadingPaymentMethods = false;
        
        // Fallback con métodos por defecto
        this.paymentMethods = [
          { id: '11111111-1111-1111-1111-111111111111', name: 'Efectivo', active: true, icon: '💵' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Tarjeta de Crédito', active: true, icon: '💳' }
        ];
      }
    });
  }
  
  // Seleccionar método de pago
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    this.checkoutForm.patchValue({
      paymentMethodId: method.id
    });
    console.log('💳 Método de pago seleccionado:', method);
  }
  
  // Actualizar cantidad de un producto
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(item);
      return;
    }
    
    const success = this.cartService.updateQuantity(
      item.product.id!,
      newQuantity,
      item.size,
      item.color
    );
    
    if (!success) {
      console.error('❌ Error al actualizar cantidad');
    }
  }
  
  // Incrementar cantidad
  incrementQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;
    const maxStock = Number(item.product.stock) || 0;
    
    if (newQuantity <= maxStock) {
      this.updateQuantity(item, newQuantity);
    } else {
      console.warn('⚠️ No hay suficiente stock');
    }
  }
  
  // Decrementar cantidad
  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }
  
  // Eliminar item del carrito
  removeItem(item: CartItem): void {
    const success = this.cartService.removeFromCart(
      item.product.id!,
      item.size,
      item.color
    );
    
    if (success) {
      console.log('🗑️ Item eliminado del carrito');
    }
  }
  
  // ✅ CORREGIDO - Proceder al checkout con formato correcto
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    if (!this.selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }
    
    this.processingCheckout = true;
    
    // ✅ FORMATO CORRECTO según el backend
    const checkoutData = {
      detalles: this.cartItems.map(item => ({
        idProducto: item.product.id!,
        cantidad: item.quantity
      })),
      userId: this.TEMP_USER_ID,
      idFormaPago: this.selectedPaymentMethod.id
    };
    
    console.log('📋 Datos del checkout:', checkoutData);
    console.log('💳 Método de pago:', this.selectedPaymentMethod);
    
    // ✅ USAR CHECKOUT SERVICE
    this.checkoutService.createCheckout(checkoutData).subscribe({
      next: (response) => {
        console.log('✅ Checkout creado exitosamente:', response);
        
        // Limpiar carrito
        this.cartService.clearCart();
        
        // Manejar respuesta según needsPayment
        if (response.needsPayment && response.paymentUrl) {
          // Redirigir a MercadoPago
          alert(`¡Orden creada! Serás redirigido al pago.\nTotal: $${response.total}`);
          window.location.href = response.paymentUrl;
        } else {
          // Pago en efectivo o ya procesado
          alert(`¡Orden creada exitosamente!\nTotal: $${response.total}\nEstado: ${response.status}`);
          this.router.navigate(['/orders']);
        }
        
        this.processingCheckout = false;
      },
      error: (error) => {
        console.error('❌ Error al crear el checkout:', error);
        alert('Error al procesar la orden. Intenta de nuevo.');
        this.processingCheckout = false;
      }
    });
  }
  
  // Continuar comprando
  continueShopping(): void {
    this.router.navigate(['/products']);
  }
  
  // Formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  // Obtener cantidad restante para envío gratis
  getAmountForFreeShipping(): number {
    return this.cartService.getAmountForFreeShipping();
  }
  
  // Obtener progreso de envío gratis
  getFreeShippingProgress(): number {
    return this.cartService.getFreeShippingProgress();
  }
  
  // Verificar si tiene envío gratis
  hasFreeShipping(): boolean {
    return this.cartSummary.shipping === 0 && this.cartSummary.subtotal > 0;
  }
}