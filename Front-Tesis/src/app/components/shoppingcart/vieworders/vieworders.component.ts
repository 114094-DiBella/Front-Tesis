import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';



export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

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
  
  // Estadísticas
  stats = {
    total: 156,
    pending: 23,
    processing: 89,
    delivered: 44,
    revenue: 125450
  };

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;


  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder){
    }

  ngOnInit(): void {
    this.calculateStats();
    this.loginOrders();
  }

  loginOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = [...this.orders]; // Inicializar órdenes filtradas
        console.log('Órdenes cargadas:', this.orders);
        this.calculateStats();
        this.filterOrders();
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
      }
    });
  }



  // Calcular estadísticas
  calculateStats(): void {
    this.stats.total = this.orders.length;
    this.stats.pending = this.orders.filter(order => order.status === 'pending').length;
    this.stats.processing = this.orders.filter(order => order.status === 'processing').length;
    this.stats.delivered = this.orders.filter(order => order.status === 'delivered').length;
    this.stats.revenue = this.orders.reduce((sum, order) => sum + order.total, 0);
  }

  // Filtrar órdenes
  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm; //|| 
        //order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        //order.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        //order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      
      const matchesDateRange = this.checkDateRange(order.createdAt);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    
    this.calculatePagination();
    this.currentPage = 1;
  }

  // Verificar rango de fechas
  checkDateRange(orderDate: Date): boolean {
    if (!this.startDate && !this.endDate) return true;
    
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

  // Navegar a página
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Página anterior
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Obtener páginas para mostrar en la paginación
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

  // Acciones de órdenes
  viewOrderDetails(order: Order): void {
    console.log('Ver detalles de la orden:', order);
    // Aquí implementarías la navegación o modal para ver detalles
  }

  updateOrderStatus(orderId: string, newStatus: Order['status']): void {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus;
      this.calculateStats();
      this.filterOrders();
      console.log(`Orden ${orderId} actualizada a estado: ${newStatus}`);
    }
  }

  printOrder(order: Order): void {
    console.log('Imprimir orden:', order);
    // Aquí implementarías la funcionalidad de impresión
  }

  cancelOrder(orderId: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      this.updateOrderStatus(orderId, 'cancelled');
    }
  }

  // Obtener clase CSS para el estado
  getStatusClass(status: Order['status']): string {
    return `status-${status}`;
  }

  // Obtener texto del estado en español
  getStatusText(status: Order['status']): string {
    // const statusTexts = {
    //   'pending': 'Pendiente',
    //   'processing': 'En Proceso',
    //   'shipped': 'Enviado',
    //   'delivered': 'Entregado',
    //   'cancelled': 'Cancelado'
    // };
    // return statusTexts[status];
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Formatear fecha
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  }

  // Obtener emoji para el item (función auxiliar para la vista)
  getItemEmoji(itemName: string): string {
    const emojiMap: {[key: string]: string} = {
      'remera': '👕',
      'jean': '👖',
      'vestido': '👗',
      'zapatillas': '👟',
      'gorra': '🧢',
      'blusa': '👚',
      'cartera': '👜',
      'chaqueta': '🧥',
      'pantalón': '👖',
      'zapatos': '👞',
      'tacones': '👠'
    };
    
    const lowerName = itemName.toLowerCase();
    for (const key in emojiMap) {
      if (lowerName.includes(key)) {
        return emojiMap[key];
      }
    }
    return '📦'; // emoji por defecto
  }
}