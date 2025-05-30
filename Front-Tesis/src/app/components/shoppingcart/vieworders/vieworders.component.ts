import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { User } from '../../../models/user.model';

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

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // ✅ NORMALIZAR DATOS de las órdenes
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

  // ✅ NUEVO - Normalizar datos de la orden
  private normalizeOrder(order: any): Order {
    // Crear usuario por defecto si es null
    const normalizedUser = order.user || new User({
      firstName: 'Usuario',
      lastName: 'Anónimo',
      email: 'no-disponible@ejemplo.com'
    });

    // Normalizar detalles
    const normalizedDetails = (order.details || []).map((detail: any) => ({
      ...detail,
      product: {
        ...detail.product,
        // Asegurar que marca tenga un formato consistente
        marca: detail.product.marca || { name: 'Sin marca' },
        // Manejar size y color como strings
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

  // Calcular estadísticas basadas en datos reales
  calculateStats(): void {
    this.stats.total = this.orders.length;
    this.stats.pending = this.orders.filter(order => order.status === OrderStatus.PENDIENTE).length;
    this.stats.approved = this.orders.filter(order => order.status === OrderStatus.PAGADA).length;
    this.stats.rejected = this.orders.filter(order => order.status === OrderStatus.RECHAZADA).length;
    this.stats.revenue = this.orders
      .filter(order => order.status === OrderStatus.PAGADA)
      .reduce((sum, order) => sum + order.total, 0);
  }

  // Filtrar órdenes
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

  // Verificar rango de fechas
  checkDateRange(orderDateString: string): boolean {
    if (!this.startDate && !this.endDate) return true;
    
    const orderDate = new Date(orderDateString);
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    
    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;
    
    return true;
  }

  // Calcular paginación
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  // Obtener órdenes para la página actual
  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  // Obtener texto del estado en español
  getStatusText(status: OrderStatus): string {
    const statusTexts = {
      [OrderStatus.PENDIENTE]: 'Pendiente',
      [OrderStatus.PAGADA]: 'Pagada',
      [OrderStatus.RECHAZADA]: 'Rechazada'
    };
    return statusTexts[status] || status;
  }

  // Obtener clase CSS para el estado
  getStatusClass(status: OrderStatus): string {
    const statusClasses = {
      [OrderStatus.PENDIENTE]: 'status-pending',
      [OrderStatus.PAGADA]: 'status-approved',
      [OrderStatus.RECHAZADA]: 'status-rejected'
    };
    return statusClasses[status] || 'status-pending';
  }

  // ✅ MEJORADO - Formatear fecha manejando diferentes formatos
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

  // Formatear precio
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

  // ✅ NUEVO - Obtener nombre completo del usuario
  getUserFullName(user: any): string {
    if (!user) return 'Usuario no disponible';
    
    const firstName = user.firstName || 'Usuario';
    const lastName = user.lastName || 'Anónimo';
    return `${firstName} ${lastName}`;
  }

  // ✅ NUEVO - Obtener email del usuario
  getUserEmail(user: any): string {
    return user?.email || 'Email no disponible';
  }

  // ✅ NUEVO - Obtener specs del producto
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

  // Acciones de órdenes
  viewOrderDetails(order: Order): void {
    console.log('Ver detalles de la orden:', order);
    // Implementar navegación o modal
  }

  printOrder(order: Order): void {
    console.log('Imprimir orden:', order);
    // Implementar funcionalidad de impresión
  }

  // Navegación
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
    
    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}