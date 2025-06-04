import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReport, ReportsService, SalesReport } from '../../services/reportes.service';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  
  // === REPORTES ===
  productReport: ProductReport | null = null;
  salesReport: SalesReport | null = null;
  
  // === TABS ===
  activeTab: 'products' | 'sales' | 'combined' = 'products';
  
  // === ESTADOS ===
  isLoading = true;
  errorMessage = '';
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.reportsService.generateCombinedReport().subscribe({
      next: (reports) => {
        this.productReport = reports.products;
        this.salesReport = reports.sales;
        this.isLoading = false;
        console.log('📊 Reportes cargados:', reports);
      },
      error: (error) => {
        console.error('Error cargando reportes:', error);
        this.errorMessage = 'Error al cargar los reportes. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // === CAMBIO DE TABS ===
  setActiveTab(tab: 'products' | 'sales' | 'combined'): void {
    this.activeTab = tab;
  }

  // === UTILIDADES ===
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Stock bajo';
    if (stock <= 20) return 'Stock medio';
    return 'Stock alto';
  }
    getStockNumber(stock: any): number {
    return Number(stock) || 0;
  }

  getStockStatusClass(stock: number): string {
    if (stock === 0) return 'status-danger';
    if (stock <= 5) return 'status-warning';
    if (stock <= 20) return 'status-info';
    return 'status-success';
  }

  // === PARA VENTAS ===
  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'PAGADA': return 'status-success';
      case 'PENDIENTE': return 'status-warning';
      case 'RECHAZADA': return 'status-danger';
      default: return 'status-info';
    }
  }

  // === REFRESH ===
  refreshReports(): void {
    this.loadReports();
  }
}