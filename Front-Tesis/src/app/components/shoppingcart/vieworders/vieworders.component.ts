import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { User } from '../../../models/user.model';
import { ReceiptService } from '../../../services/receipt.service'; // ✅ AGREGADO

@Component({
  selector: 'app-vieworders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vieworders.component.html',
  styleUrl: './vieworders.component.css'
})
export class ViewordersComponent implements OnInit {
  
  // Propiedades para filtros
  searchTerm: string = '';
  statusFilter: string = '';
  startDate: string = '';
  endDate: string = '';
  
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Estadísticas calculadas dinámicamente
  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revenue: 0
  };

  downloadingReceipts: Set<string> = new Set();

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  isDownloading = false;
  isPreviewLoading = false;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private receiptService: ReceiptService // ✅ AGREGADO
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map(order => this.normalizeOrder(order));
        this.filteredOrders = [...this.orders];
        console.log('Órdenes cargadas y normalizadas:', this.orders);
        this.calculateStats();
        this.filterOrders();
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
      }
    });
  }

  private normalizeOrder(order: any): Order {
    const normalizedUser = order.user || new User({
      firstName: 'Usuario',
      lastName: 'Anónimo',
      email: 'no-disponible@ejemplo.com'
    });

    const normalizedDetails = (order.details || []).map((detail: any) => ({
      ...detail,
      product: {
        ...detail.product,
        marca: detail.product.marca || { name: 'Sin marca' },
        size: detail.product.size || 'N/A',
        color: detail.product.color || 'N/A'
      }
    }));

    return new Order({
      ...order,
      user: normalizedUser,
      details: normalizedDetails
    });
  }

  calculateStats(): void {
    this.stats.total = this.orders.length;
    this.stats.pending = this.orders.filter(order => order.status === OrderStatus.PENDIENTE).length;
    this.stats.approved = this.orders.filter(order => order.status === OrderStatus.PAGADA).length;
    this.stats.rejected = this.orders.filter(order => order.status === OrderStatus.RECHAZADA).length;
    this.stats.revenue = this.orders
      .filter(order => order.status === OrderStatus.PAGADA)
      .reduce((sum, order) => sum + order.total, 0);
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.codOrder.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (order.user.firstName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (order.user.lastName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (order.user.email || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      const matchesDateRange = this.checkDateRange(order.createdAt);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    
    this.calculatePagination();
    this.currentPage = 1;
  }

  checkDateRange(orderDateString: string): boolean {
    if (!this.startDate && !this.endDate) return true;
    
    const orderDate = new Date(orderDateString);
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    
    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;
    
    return true;
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  getStatusText(status: OrderStatus): string {
    const statusTexts = {
      [OrderStatus.PENDIENTE]: 'Pendiente',
      [OrderStatus.PAGADA]: 'Pagada',
      [OrderStatus.RECHAZADA]: 'Rechazada'
    };
    return statusTexts[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses = {
      [OrderStatus.PENDIENTE]: 'status-pending',
      [OrderStatus.PAGADA]: 'status-approved',
      [OrderStatus.RECHAZADA]: 'status-rejected'
    };
    return statusClasses[status] || 'status-pending';
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no válida';
      }
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  }

  formatPrice(price: number): string {
    if (isNaN(price) || price === null || price === undefined) {
      return '$0,00';
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  }

  getUserFullName(user: any): string {
    if (!user) return 'Usuario no disponible';
    
    const firstName = user.firstName || 'Usuario';
    const lastName = user.lastName || 'Anónimo';
    return `${firstName} ${lastName}`;
  }

  getUserEmail(user: any): string {
    return user?.email || 'Email no disponible';
  }

  getProductSpecs(product: any): string {
    const specs = [];
    
    if (product.marca?.name) {
      specs.push(product.marca.name);
    }
    
    if (product.size && product.size !== 'N/A') {
      specs.push(`Talla: ${product.size}`);
    }
    
    if (product.color && product.color !== 'N/A') {
      specs.push(`Color: ${product.color}`);
    }
    
    return specs.length > 0 ? specs.join(' • ') : 'Sin especificaciones';
  }

 downloadReceipt(orderCode: string): void {
    if (!orderCode || !orderCode.trim()) {
      this.showError('Código de orden requerido');
      return;
    }

    this.isDownloading = true;
    this.clearError();

    this.receiptService.downloadReceipt(orderCode).subscribe({
      next: (response) => {
        this.handleDownloadSuccess(response, orderCode);
        this.isDownloading = false;
      },
      error: (error) => {
        this.handleDownloadError(error);
        this.isDownloading = false;
      }
    });
  }

  /**
   * Vista previa del comprobante
   */
  previewReceipt(orderCode: string): void {
    if (!orderCode || !orderCode.trim()) {
      this.showError('Código de orden requerido');
      return;
    }

    this.isPreviewLoading = true;
    this.clearError();

    this.receiptService.previewReceipt(orderCode).subscribe({
      next: (response) => {
        this.handlePreviewSuccess(response);
        this.isPreviewLoading = false;
      },
      error: (error) => {
        this.handleDownloadError(error);
        this.isPreviewLoading = false;
      }
    });
  }

  /**
   * Verificar disponibilidad del comprobante
   */
  checkReceiptAvailability(orderCode: string): void {
    this.receiptService.checkReceiptStatus(orderCode).subscribe({
      next: (response) => {
        if (response.available) {
          console.log('✅ Comprobante disponible:', response.message);
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        this.handleDownloadError(error);
      }
    });
  }

  /**
   * Maneja la descarga exitosa del PDF
   */
  private handleDownloadSuccess(response: any, orderCode: string): void {
    const blob = response.body;
    
    if (!blob || blob.size === 0) {
      this.showError('El archivo PDF está vacío');
      return;
    }

    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento anchor temporal para descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante-${orderCode}.pdf`;
    
    // Simular click para descargar
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ Comprobante descargado exitosamente');
  }

  /**
   * Maneja la vista previa exitosa del PDF
   */
  private handlePreviewSuccess(response: any): void {
    const blob = response.body;
    
    if (!blob || blob.size === 0) {
      this.showError('El archivo PDF está vacío');
      return;
    }

    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Abrir en nueva ventana
    window.open(url, '_blank');
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    console.log('✅ Vista previa abierta exitosamente');
  }

  /**
   * Maneja errores de descarga
   */
  private handleDownloadError(error: any): void {
    console.error('❌ Error:', error);
    
    let errorMsg = 'Error desconocido';

    if (error.status === 400) {
      errorMsg = 'Solicitud inválida - Verifique el código de orden';
    } else if (error.status === 404) {
      errorMsg = 'Comprobante no encontrado';
    } else if (error.status === 500) {
      errorMsg = 'Error interno del servidor';
    } else if (error.error && typeof error.error === 'string') {
      errorMsg = error.error;
    } else if (error.message) {
      errorMsg = error.message;
    }

    this.showError(errorMsg);
  }

  /**
   * Mostrar mensaje de error
   */
  private showError(message: string): void {
    this.errorMessage = message;
    console.error('❌', message);
  }

  /**
   * Limpiar mensaje de error
   */
  private clearError(): void {
    this.errorMessage = '';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // viewUrlPago(order: Order): void {
  //   if (order && order.urlPago) {
  //     window.open(order.urlPago, '_blank');
  //   } else {
  //     this.showError('URL de pago no disponible para esta orden');
  //   }
  // }
}