import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { ShipmentResponse, ShippingService } from '../../../services/shipping.service';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {
  orderData: Order | null = null;
  isLoading = true;
  orderId: string | null = null;
  shipmentData: ShipmentResponse | null = null;
  trackingNumber: string | null = null;
  hasShipment: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,

    private shippingService: ShippingService
  ) {}

  ngOnInit() {
    // Obtener orderId de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || params['orderCode'] || null;
      const isPending = params['pending'] === 'true';
      
      console.log('🔍 Parámetros recibidos:', params);
      console.log('🆔 Order ID:', this.orderId);
      console.log('⏳ Es pendiente:', isPending);
      
      if (this.orderId && this.orderId !== 'pending') {
        this.loadOrderData();
      } else if (isPending) {
        // Mostrar mensaje de pago pendiente
        console.log('⏳ Pago pendiente, mostrando mensaje informativo');
        this.isLoading = false;
        // Podrías mostrar una UI diferente aquí
      } else {
        console.error('No se encontró ID de orden válido en los parámetros');
        this.isLoading = false;
      }
    });
  }

  loadOrderData() {
    if (!this.orderId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    
    console.log('🔄 Cargando datos de la orden:', this.orderId);
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.orderData = order;
        this.isLoading = false;
        console.log('✅ Orden cargada exitosamente:', order);
        this.loadShipmentData();
      },
      error: (error) => {
        console.error('❌ Error al cargar la orden:', error);
        console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
        
        // Si es un error 404, probablemente la orden no existe aún
        if (error.status === 404) {
          console.log('🔍 Orden no encontrada, podría estar en proceso...');
          // Intentar recargar después de un delay
          setTimeout(() => {
            console.log('🔄 Reintentando cargar orden...');
            this.loadOrderData();
          }, 3000);
        } else {
          this.isLoading = false;
        }
      }
    });
  }

  getStatusClass(): string {
    if (!this.orderData) return '';
    return this.orderData.status.toString();
  }

  getStatusText(): string {
    if (!this.orderData) return '';
    
    switch (this.orderData.status) {
      case OrderStatus.PENDIENTE:
        return 'Pendiente';
      case OrderStatus.PAGADA:
        return 'Pagada';
      case OrderStatus.RECHAZADA:
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  }

  getFormattedDate(): string {
    if (!this.orderData?.createdAt) return '';
    
    const date = new Date(this.orderData.createdAt);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCustomerName(): string {
    if (!this.orderData?.user) return 'Cliente';
    
    const { firstName, lastName } = this.orderData.user;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return this.orderData.user.email || 'Cliente';
  }

  getProductImage(product: any): string {
    if (product.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls[0];
    }
    return '/images/problemastecnicos.jpeg';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/store']);
  }

    /**
   * Cargar información del envío
   */
  loadShipmentData(): void {
    if (!this.orderId) {
      this.isLoading = false;
      return;
    }

    console.log('📦 Buscando información de envío para orden:', this.orderId);
    
    this.shippingService.getShipmentByOrderCode(this.orderId).subscribe({
      next: (shipment) => {
        this.shipmentData = shipment;
        this.trackingNumber = shipment.trackingNumber || null;
        this.hasShipment = true;
        console.log('✅ Información de envío encontrada:', shipment);
        this.isLoading = false;
      },
      error: (error) => {
        console.log('ℹ️ No se encontró información de envío para esta orden (normal si es retiro en tienda)');
        this.hasShipment = false;
        this.isLoading = false;
      }
    });
  }

  /**
   * Redirigir al tracking de Andreani
   */
  trackOnAndreani(): void {
    if (!this.trackingNumber) {
      alert('No hay número de seguimiento disponible');
      return;
    }

    // URL de tracking de Andreani
    const andreaniTrackingUrl = `https://www.andreani.com/seguimiento?codigo=${this.trackingNumber}`;
    
    // Abrir en nueva pestaña
    window.open(andreaniTrackingUrl, '_blank');
    
    console.log('🔗 Redirigiendo a Andreani tracking:', andreaniTrackingUrl);
  }

  /**
   * Ir al tracking interno
   */
  goToInternalTracking(): void {
    if (this.trackingNumber) {
      this.router.navigate(['/tracking'], { 
        queryParams: { search: this.trackingNumber } 
      });
    } else if (this.orderId) {
      this.router.navigate(['/tracking'], { 
        queryParams: { search: this.orderId } 
      });
    }
  }

  /**
   * Obtener estado del envío en texto legible
   */
  getShipmentStatusText(): string {
    if (!this.shipmentData) return 'Sin información';
    
    const statusMap: { [key: string]: string } = {
      'PENDING': '⏳ Pendiente',
      'CREATED': '📋 Creado',
      'PICKED_UP': '📦 Retirado',
      'IN_TRANSIT': '🚛 En Tránsito',
      'OUT_FOR_DELIVERY': '🚚 En Reparto',
      'DELIVERED': '✅ Entregado',
      'RETURNED': '↩️ Devuelto',
      'ERROR': '❌ Error'
    };
    
    return statusMap[this.shipmentData.status] || this.shipmentData.status;
  }

  /**
   * Obtener clase CSS para el estado del envío
   */
  getShipmentStatusClass(): string {
    if (!this.shipmentData) return '';
    
    switch (this.shipmentData.status) {
      case 'DELIVERED': return 'status-delivered';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY': return 'status-in-transit';
      case 'CREATED':
      case 'PICKED_UP': return 'status-created';
      case 'ERROR': return 'status-error';
      default: return 'status-pending';
    }
  }
}
