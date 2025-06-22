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
import { CreateShipmentRequest, QuoteRequest, ShippingAddress, ShippingQuote, ShippingService } from '../../../services/shipping.service';
import { ToastrService } from 'ngx-toastr';

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

  shippingQuotes: ShippingQuote[] = [];
  selectedShippingQuote: ShippingQuote | null = null;
  shippingAddress: ShippingAddress | null = null;
  loadingShippingQuotes: boolean = false;

  constructor(
    private checkoutService: CheckoutService, // ✅ CAMBIO: Usar CheckoutService
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private shippingService: ShippingService,
    private toastr: ToastrService // Para notificaciones 
  ) {
    this.checkoutForm = this.fb.group({
      paymentMethodId: ['']
    });
  }

  ngOnInit(): void {
    this.subscribeToCart();
    this.loadPaymentMethods();

    console.log('🛒 Items del carrito:', this.cartItems);
      this.cartItems.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          product: item.product,
          imageUrls: item.product?.imageUrls,
          hasImages: item.product?.imageUrls?.length
        });
      });
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
  
proceedToCheckout(): void {
  if (this.cartItems.length === 0) {
    this.toastr.warning('Tu carrito está vacío', 'Carrito Vacío');
    return;
  }
  
  this.processingCheckout = true;
  
  const checkoutData = {
    detalles: this.cartItems.map(item => ({
      idProducto: item.product.id!,
      cantidad: item.quantity
    })),
    userId: this.TEMP_USER_ID,
    idFormaPago: this.selectedPaymentMethod?.id || '11111111-1111-1111-1111-111111111111',
  };
  
  console.log('📋 Datos del checkout:', checkoutData);
  
  this.checkoutService.createCheckout(checkoutData).subscribe({
    next: (response) => {
      console.log('✅ Checkout creado exitosamente:', response);
      
      // 🔍 DEBUG: Imprimir TODA la estructura de respuesta
      console.log('🔍 Estructura completa de respuesta:', JSON.stringify(response, null, 2));
      console.log('🔍 Claves de la respuesta:', Object.keys(response));
      
      // Limpiar carrito
      this.cartService.clearCart();
      
      // 🔍 Buscar el ID de la orden en diferentes posibles campos
        let orderIdentifier = this.extractOrderId(response);
        console.log('🆔 ID de orden:', orderIdentifier);

        // 📦 CREAR ENVÍO SI HAY DATOS DE ENVÍO
        if (orderIdentifier && this.selectedShippingQuote) {
          this.createShipment(orderIdentifier);
        }
      
      // Intentar diferentes posibles nombres de campos
      const possibleIdFields = [
        'orderId', 'id', 'codOrder', 'orderCode', 'codigo', 'codigoOrden',
        'facturaId', 'factura', 'numeroOrden', 'orderNumber'
      ];
      
      for (const field of possibleIdFields) {
        if (response[field]) {
          orderIdentifier = response[field];
          console.log(`✅ ID de orden encontrado en campo '${field}':`, orderIdentifier);
          break;
        }
      }
      
      // Si no encontramos ID en campos simples, buscar en objetos anidados
      if (!orderIdentifier) {
        console.log('🔍 Buscando en objetos anidados...');
        if (response.order) {
          orderIdentifier = response.order.id || response.order.codOrder || response.order.codigo;
          console.log('🔍 ID encontrado en response.order:', orderIdentifier);
        }
        if (response.factura && !orderIdentifier) {
          orderIdentifier = response.factura.id || response.factura.codigo || response.factura.codOrder;
          console.log('🔍 ID encontrado en response.factura:', orderIdentifier);
        }
      }
      
      console.log('🆔 ID final de orden a usar:', orderIdentifier);
      
      // Manejar respuesta según needsPayment
      if (response.needsPayment && response.paymentUrl) {
        // Para MercadoPago - guardar el ID de la orden para después del pago
        if (orderIdentifier) {
          localStorage.setItem('pendingOrderId', orderIdentifier.toString());
          console.log('💾 ID de orden pendiente guardado:', orderIdentifier);
        } else {
          console.error('❌ No se pudo encontrar un identificador de orden válido');
          // Usar un timestamp como fallback temporal
          const fallbackId = 'temp_' + Date.now();
          localStorage.setItem('pendingOrderId', fallbackId);
          console.log('⚠️ Usando ID temporal como fallback:', fallbackId);
        }
        
        // Abrir MercadoPago en nueva pestaña
        window.open(response.paymentUrl, '_blank');
        console.log('🌐 Abriendo MercadoPago en nueva pestaña');
        
        // Redirigir a página de éxito (mostrará "pendiente" si es necesario)
        this.router.navigate(['/payment/success'], {
          queryParams: {
            orderId: orderIdentifier || 'pending',
            pending: true // Flag para indicar que el pago está pendiente
          }
        });
        
      } else {
        // Pago completado o en efectivo - redirigir directamente a la página de éxito
        this.router.navigate(['/payment/success'], {
          queryParams: {
            orderId: orderIdentifier || 'completed_' + Date.now()
          }
        });
      }
      
      this.processingCheckout = false;
    },
    error: (error) => {
      console.error('❌ Error al crear el checkout:', error);
      console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
      this.toastr.error('Error al procesar tu orden. Intenta de nuevo.', 'Error de Checkout');
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


  getShippingQuotes(destinationAddress: ShippingAddress): void {
    // Dirección de origen (tu tienda)
    const originAddress: ShippingAddress = {
      street: 'Tu Calle',
      streetNumber: '123',
      city: 'Córdoba',
      province: 'Córdoba',
      postalCode: '5000'
    };

    // Calcular peso y valor declarado
    const totalWeight = this.calculateTotalWeight();
    const declaredValue = this.cartSummary.subtotal;

    const quoteRequest: QuoteRequest = {
      originAddress,
      destinationAddress,
      weightKg: totalWeight,
      declaredValue
    };

    this.loadingShippingQuotes = true;
    console.log('📦 Solicitando cotizaciones de envío:', quoteRequest);

    this.shippingService.getShippingQuotes(quoteRequest).subscribe({
      next: (quotes) => {
        this.shippingQuotes = quotes;
        this.shippingAddress = destinationAddress;
        console.log('✅ Cotizaciones obtenidas:', quotes);
        this.loadingShippingQuotes = false;
      },
      error: (error) => {
        console.error('❌ Error al obtener cotizaciones:', error);
        this.loadingShippingQuotes = false;
        this.toastr.error('Error al obtener cotizaciones de envío. Intenta de nuevo.', 'Error de Envío');
      }
    });
  }

  /**
   * Seleccionar opción de envío
   */
  selectShippingQuote(quote: ShippingQuote): void {
    this.selectedShippingQuote = quote;
    
    // Actualizar el costo de envío en el resumen
    this.cartSummary.shipping = quote.price;
    this.cartSummary.total = this.cartSummary.subtotal - this.cartSummary.discount + quote.price;
    
    console.log('📦 Opción de envío seleccionada:', quote);
  }

  /**
   * Calcular peso total del carrito
   */
  private calculateTotalWeight(): number {
    // Asumir 0.5kg por producto como default
    return this.cartItems.reduce((total, item) => {
      const itemWeight = item.product.weight || 0.5; // kg por producto
      return total + (itemWeight * item.quantity);
    }, 0);
  }

  /**
   * Crear envío después del checkout exitoso
   */
  private createShipment(orderCode: string): void {
    if (!this.selectedShippingQuote || !this.shippingAddress) {
      console.log('ℹ️ No hay envío seleccionado, omitiendo creación de envío');
      return;
    }

    // Datos del destinatario (estos vendrían de un formulario)
    const shipmentRequest: CreateShipmentRequest = {
      orderCode: orderCode,
      recipientName: 'Nombre del cliente', // Obtener del formulario
      recipientEmail: 'email@cliente.com', // Obtener del formulario
      recipientPhone: '+54123456789', // Obtener del formulario
      shippingAddress: this.shippingAddress,
      serviceType: this.selectedShippingQuote.serviceType,
      weightKg: this.calculateTotalWeight(),
      declaredValue: this.cartSummary.subtotal
    };

    console.log('📦 Creando envío:', shipmentRequest);

    this.shippingService.createShipment(shipmentRequest).subscribe({
      next: (shipment) => {
        console.log('✅ Envío creado exitosamente:', shipment);
        // Guardar el tracking number para mostrarlo después
        if (shipment.trackingNumber) {
          localStorage.setItem('lastTrackingNumber', shipment.trackingNumber);
        }
      },
      error: (error) => {
        console.error('❌ Error al crear envío:', error);
        // No fallar el checkout por esto, solo mostrar advertencia
        console.warn('⚠️ El pedido se procesó pero hubo un problema con el envío');
      }
    });
  }
  /**
   * Obtener información de envío por código de orden
   */
  getShipmentInfo(orderCode: string): void {
    this.shippingService.getShipmentByOrderCode(orderCode).subscribe({
      next: (shipment) => {
        console.log('📦 Información del envío:', shipment);
        // Manejar la información del envío
      },
      error: (error) => {
        console.error('❌ Error al obtener información del envío:', error);
      }
    });
  }

  /**
   * Rastrear envío por número de tracking
   */
  trackShipment(trackingNumber: string): void {
    this.shippingService.trackShipment(trackingNumber).subscribe({
      next: (shipment) => {
        console.log('🔍 Tracking del envío:', shipment);
        // Mostrar información de tracking
      },
      error: (error) => {
        console.error('❌ Error al rastrear envío:', error);
      }
    });
  }

  /**
 * Extraer ID de orden de la respuesta del checkout
 */
private extractOrderId(response: any): string | null {
  // Buscar el ID en diferentes posibles campos
  const possibleIdFields = [
    'orderId', 'id', 'codOrder', 'orderCode', 'codigo', 'codigoOrden',
    'facturaId', 'factura', 'numeroOrden', 'orderNumber'
  ];
  
  // Buscar en campos directos
  for (const field of possibleIdFields) {
    if (response[field]) {
      console.log(`✅ ID de orden encontrado en campo '${field}':`, response[field]);
      return response[field];
    }
  }
  
  // Buscar en objetos anidados
  if (response.order) {
    const orderId = response.order.id || response.order.codOrder || response.order.codigo;
    if (orderId) {
      console.log('🔍 ID encontrado en response.order:', orderId);
      return orderId;
    }
  }
  
  if (response.factura) {
    const facturaId = response.factura.id || response.factura.codigo || response.factura.codOrder;
    if (facturaId) {
      console.log('🔍 ID encontrado en response.factura:', facturaId);
      return facturaId;
    }
  }
  
  console.warn('⚠️ No se pudo encontrar un identificador de orden válido en la respuesta');
  return null;
}
}