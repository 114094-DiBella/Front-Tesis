import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ProductService } from './product.service';
import { OrderService } from './order.service';
import { CategoryService } from './category.services';
import { MarcaService } from './marcas.services';
import { Product } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';

export interface ProductReport {
  // KPIs de productos
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  
  // KPIs de inventario
  totalStock: number;
  averageStock: number;
  totalInventoryValue: number;
  averagePrice: number;
  
  // Distribuciones
  productsByCategory: Array<{name: string, count: number, percentage: number}>;
  productsByBrand: Array<{name: string, count: number, percentage: number}>;
  priceRanges: Array<{range: string, count: number, percentage: number}>;
  stockLevels: Array<{level: string, count: number, percentage: number}>;
  
  // Productos específicos
  lowStockItems: Product[];
  topValueProducts: Array<Product & {totalValue: number}>;
  mostExpensiveProducts: Product[];
  bestStockProducts: Product[];
}

export interface SalesReport {
  // KPIs de ventas
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  successfulOrders: number;
  pendingOrders: number;
  rejectedOrders: number;
  
  // Métricas temporales
  salesByMonth: Array<{month: string, orders: number, revenue: number}>;
  salesByDay: Array<{day: string, orders: number, revenue: number}>;
  
  // Top productos vendidos
  topSellingProducts: Array<{product: Product, quantitySold: number, revenue: number}>;
  
  // Análisis de clientes
  topCustomers: Array<{user: any, totalOrders: number, totalSpent: number}>;
  
  // Análisis de pagos
  paymentMethodsUsage: Array<{method: string, count: number, percentage: number}>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private categoryService: CategoryService,
    private marcaService: MarcaService
  ) {}

  // Generar reporte completo de productos
  generateProductReport(): Observable<ProductReport> {
    return this.productService.getAllProducts().pipe(
      map(products => this.calculateProductReport(products))
    );
  }

  // Generar reporte completo de ventas
  generateSalesReport(): Observable<SalesReport> {
    return forkJoin({
      orders: this.orderService.getOrders(),
      products: this.productService.getAllProducts()
    }).pipe(
      map(({orders, products}) => this.calculateSalesReport(orders, products))
    );
  }

  // Generar reporte combinado
  generateCombinedReport(): Observable<{products: ProductReport, sales: SalesReport}> {
    return forkJoin({
      products: this.generateProductReport(),
      sales: this.generateSalesReport()
    });
  }

  private calculateProductReport(products: Product[]): ProductReport {
    const activeProducts = products.filter(p => p.active);
    const totalProducts = products.length;
    
    // KPIs básicos
    const kpis = {
      totalProducts,
      activeProducts: activeProducts.length,
      inactiveProducts: totalProducts - activeProducts.length,
      lowStockProducts: products.filter(p => this.getStock(p) > 0 && this.getStock(p) <= 5).length,
      outOfStockProducts: products.filter(p => this.getStock(p) === 0).length,
      totalStock: products.reduce((sum, p) => sum + this.getStock(p), 0),
      averageStock: 0,
      totalInventoryValue: 0,
      averagePrice: 0
    };

    kpis.averageStock = totalProducts > 0 ? Math.round(kpis.totalStock / totalProducts) : 0;
    kpis.totalInventoryValue = products.reduce((sum, p) => sum + (this.getStock(p) * (p.price || 0)), 0);
    kpis.averagePrice = kpis.totalStock > 0 ? kpis.totalInventoryValue / kpis.totalStock : 0;

    // Distribuciones
    const categoryCount = this.groupBy(products, p => p.category?.name || 'Sin categoría');
    const brandCount = this.groupBy(products, p => p.marca?.name || 'Sin marca');
    
    return {
      ...kpis,
      productsByCategory: this.calculatePercentages(categoryCount, totalProducts),
      productsByBrand: this.calculatePercentages(brandCount, totalProducts),
      priceRanges: this.calculatePriceRanges(products),
      stockLevels: this.calculateStockLevels(products),
      lowStockItems: products.filter(p => this.getStock(p) > 0 && this.getStock(p) <= 5).slice(0, 10),
      topValueProducts: products
        .map(p => ({...p, totalValue: this.getStock(p) * (p.price || 0)}))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10),
      mostExpensiveProducts: products.sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5),
      bestStockProducts: products.sort((a, b) => this.getStock(b) - this.getStock(a)).slice(0, 5)
    };
  }

  private calculateSalesReport(orders: Order[], products: Product[]): SalesReport {
    const totalOrders = orders.length;
    const successfulOrders = orders.filter(o => o.status === OrderStatus.PAGADA);
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.total, 0);
    
    // KPIs básicos
    const kpis = {
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      successfulOrders: successfulOrders.length,
      pendingOrders: orders.filter(o => o.status === OrderStatus.PENDIENTE).length,
      rejectedOrders: orders.filter(o => o.status === OrderStatus.RECHAZADA).length
    };

    // Análisis temporal - using separate methods
    const salesByMonth = this.groupOrdersByMonth(orders);
    const salesByDay = this.groupOrdersByDay(orders.slice(-30)); // Últimos 30 días

    // Top productos vendidos
    const productSales = this.calculateProductSales(orders);
    
    // Top clientes
    const customerSales = this.calculateCustomerSales(orders);

    // Métodos de pago
    const paymentMethods = this.groupBy(orders, o => o.idFormaPago);

    return {
      ...kpis,
      salesByMonth,
      salesByDay,
      topSellingProducts: productSales.slice(0, 10),
      topCustomers: customerSales.slice(0, 10),
      paymentMethodsUsage: this.calculatePercentages(paymentMethods, totalOrders).map(item => ({
        method: item.name,
        count: item.count,
        percentage: item.percentage
      }))
    };
  }

  // Utilidades
  private getStock(product: Product): number {
    return Number(product.stock) || 0;
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): {[key: string]: number} {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as {[key: string]: number});
  }

  private calculatePercentages(counts: {[key: string]: number}, total: number) {
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  private calculatePriceRanges(products: Product[]) {
    const ranges = [
      { range: '$0 - $5,000', min: 0, max: 5000 },
      { range: '$5,001 - $15,000', min: 5001, max: 15000 },
      { range: '$15,001 - $30,000', min: 15001, max: 30000 },
      { range: '$30,001+', min: 30001, max: Infinity }
    ];

    const total = products.length;
    return ranges.map(range => {
      const count = products.filter(p => {
        const price = p.price || 0;
        return price >= range.min && price <= range.max;
      }).length;
      
      return {
        range: range.range,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }

  private calculateStockLevels(products: Product[]) {
    const levels = [
      { level: 'Sin stock', min: 0, max: 0 },
      { level: 'Stock bajo (1-5)', min: 1, max: 5 },
      { level: 'Stock medio (6-20)', min: 6, max: 20 },
      { level: 'Stock alto (21+)', min: 21, max: Infinity }
    ];

    const total = products.length;
    return levels.map(level => {
      const count = products.filter(p => {
        const stock = this.getStock(p);
        return stock >= level.min && stock <= level.max;
      }).length;
      
      return {
        level: level.level,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }

  // Separate methods for month and day grouping to ensure type safety
  private groupOrdersByMonth(orders: Order[]): Array<{month: string, orders: number, revenue: number}> {
    const grouped = orders.reduce((groups, order) => {
      const date = new Date(order.createdAt);
      const key = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      
      if (!groups[key]) {
        groups[key] = { orders: 0, revenue: 0 };
      }
      
      groups[key].orders++;
      if (order.status === OrderStatus.PAGADA) {
        groups[key].revenue += order.total;
      }
      
      return groups;
    }, {} as {[key: string]: {orders: number, revenue: number}});

    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => a.orders - b.orders);
  }

  private groupOrdersByDay(orders: Order[]): Array<{day: string, orders: number, revenue: number}> {
    const grouped = orders.reduce((groups, order) => {
      const date = new Date(order.createdAt);
      const key = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      
      if (!groups[key]) {
        groups[key] = { orders: 0, revenue: 0 };
      }
      
      groups[key].orders++;
      if (order.status === OrderStatus.PAGADA) {
        groups[key].revenue += order.total;
      }
      
      return groups;
    }, {} as {[key: string]: {orders: number, revenue: number}});

    return Object.entries(grouped)
      .map(([day, data]) => ({
        day,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => a.orders - b.orders);
  }

  private calculateProductSales(orders: Order[]) {
    const productSales: {[productId: string]: {product: Product, quantitySold: number, revenue: number}} = {};
    
    orders.forEach(order => {
      if (order.status === OrderStatus.PAGADA) {
        order.details.forEach(detail => {
          const productId = detail.product.id!;
          if (!productSales[productId]) {
            productSales[productId] = {
              product: detail.product,
              quantitySold: 0,
              revenue: 0
            };
          }
          productSales[productId].quantitySold += detail.quantity;
          productSales[productId].revenue += detail.subTotal;
        });
      }
    });

    return Object.values(productSales).sort((a, b) => b.quantitySold - a.quantitySold);
  }

  private calculateCustomerSales(orders: Order[]) {
    const customerSales: {[userId: string]: {user: any, totalOrders: number, totalSpent: number}} = {};
    
    orders.forEach(order => {
      const userId = order.user.id || 'unknown';
      if (!customerSales[userId]) {
        customerSales[userId] = {
          user: order.user,
          totalOrders: 0,
          totalSpent: 0
        };
      }
      customerSales[userId].totalOrders++;
      if (order.status === OrderStatus.PAGADA) {
        customerSales[userId].totalSpent += order.total;
      }
    });

    return Object.values(customerSales).sort((a, b) => b.totalSpent - a.totalSpent);
  }
}