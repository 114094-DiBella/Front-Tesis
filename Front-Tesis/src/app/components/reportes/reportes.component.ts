import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.services';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
Number(arg0: BigInteger|undefined): number {
throw new Error('Method not implemented.');
}
  
  // === KPIs PRINCIPALES ===
  kpis = {
    // Productos
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    
    // Inventario
    totalStock: 0,
    averageStock: 0,
    totalValue: 0,
    averagePrice: 0,
    
    // Categorías
    totalCategories: 0,
    mostPopularCategory: '',
    
    // Marcas
    totalBrands: 0,
    mostPopularBrand: '',
    
    // Ventas (si tienes orders)
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  };

  // === DATOS PARA GRÁFICOS ===
  productsByCategory: any[] = [];
  productsByBrand: any[] = [];
  stockDistribution: any[] = [];
  priceRanges: any[] = [];
  
  // === LISTAS DETALLADAS ===
  lowStockProducts: Product[] = [];
  topValueProducts: Product[] = [];
  
  isLoading = true;
  
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadReportsData();
  }

  loadReportsData(): void {
    this.isLoading = true;
    
    // Cargar productos
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.calculateProductKPIs(products);
        this.calculateInventoryKPIs(products);
        this.generateDistributionData(products);
        this.identifyLowStockProducts(products);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.isLoading = false;
      }
    });

    // Cargar órdenes si están disponibles
    this.loadOrdersData();
  }

  calculateProductKPIs(products: Product[]): void {
    this.kpis.totalProducts = products.length;
    this.kpis.activeProducts = products.filter(p => p.active).length;
    this.kpis.inactiveProducts = products.filter(p => !p.active).length;
    this.kpis.outOfStockProducts = products.filter(p => Number(p.stock) === 0).length;
    this.kpis.lowStockProducts = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  }

  calculateInventoryKPIs(products: Product[]): void {
    const activeProducts = products.filter(p => p.active && p.stock && p.price);
    
    this.kpis.totalStock = activeProducts.reduce((sum, p) => sum + Number(p.stock), 0);
    this.kpis.averageStock = activeProducts.length > 0 ? Math.round(this.kpis.totalStock / activeProducts.length) : 0;
    
    this.kpis.totalValue = activeProducts.reduce((sum, p) => sum + (Number(p.stock) * Number(p.price)), 0);
    this.kpis.averagePrice = activeProducts.length > 0 ? this.kpis.totalValue / this.kpis.totalStock : 0;
  }

  generateDistributionData(products: Product[]): void {
    // Productos por categoría
    const categoryCount: {[key: string]: number} = {};
    products.forEach(p => {
      const category = p.category?.name || 'Sin categoría';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    this.productsByCategory = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    this.kpis.totalCategories = this.productsByCategory.length;
    this.kpis.mostPopularCategory = this.productsByCategory[0]?.name || 'N/A';

    // Productos por marca
    const brandCount: {[key: string]: number} = {};
    products.forEach(p => {
      const brand = p.marca?.name || 'Sin marca';
      brandCount[brand] = (brandCount[brand] || 0) + 1;
    });
    
    this.productsByBrand = Object.entries(brandCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    this.kpis.totalBrands = this.productsByBrand.length;
    this.kpis.mostPopularBrand = this.productsByBrand[0]?.name || 'N/A';

    // Distribución por rangos de precio
    this.priceRanges = [
      { range: '$0 - $5,000', count: products.filter(p => Number(p.price) <= 5000).length },
      { range: '$5,001 - $15,000', count: products.filter(p => Number(p.price) > 5000 && Number(p.price) <= 15000).length },
      { range: '$15,001 - $30,000', count: products.filter(p => Number(p.price) > 15000 && Number(p.price) <= 30000).length },
      { range: '$30,001+', count: products.filter(p => Number(p.price) > 30000).length }
    ];
  }

  identifyLowStockProducts(products: Product[]): void {
    this.lowStockProducts = products
      .filter(p => p.active && Number(p.stock) > 0 && Number(p.stock) <= 5)
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 10);

    this.topValueProducts = products
      .filter(p => p.active && p.stock && p.price)
      .map(p => ({
        ...p,
        totalValue: Number(p.stock) * Number(p.price)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  }

  loadOrdersData(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.kpis.totalOrders = orders.length;
        this.kpis.totalRevenue = orders
          .filter(o => o.status === 'PAGADA')
          .reduce((sum, o) => sum + o.total, 0);
        this.kpis.averageOrderValue = this.kpis.totalOrders > 0 ? 
          this.kpis.totalRevenue / this.kpis.totalOrders : 0;
      },
      error: (error) => {
        console.error('Error cargando órdenes:', error);
      }
    });
  }

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

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Stock bajo';
    if (stock <= 20) return 'Stock medio';
    return 'Stock alto';
  }

  getStockStatusClass(stock: number): string {
    if (stock === 0) return 'status-danger';
    if (stock <= 5) return 'status-warning';
    if (stock <= 20) return 'status-info';
    return 'status-success';
  }
}