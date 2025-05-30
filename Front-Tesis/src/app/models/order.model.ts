import { Product } from "./product.model";
import { User } from "./user.model";

export class Order {
    codOrder: string;           // Código legible como "COD-000001"
    user: User;         // Objeto completo del usuario
    details: OrderDetail[];     // Detalles con productos completos
    total: number;
    idFormaPago: string;
    createdAt: string;          // Viene como string desde la API
    status: OrderStatus;
    
    constructor(data?: Partial<Order>) {
        this.codOrder = data?.codOrder || '';
        this.user = data?.user || new User();
        this.details = data?.details || [];
        this.total = data?.total || 0;
        this.idFormaPago = data?.idFormaPago || '';
        this.createdAt = data?.createdAt || '';
        this.status = data?.status || OrderStatus.PENDIENTE;
    }
}

export class OrderDetail {
    product: Product;   // Producto completo, no solo ID
    quantity: number;           // quantity en lugar de cantidad
    priceUnit: number;          // priceUnit en lugar de precioUnitario
    subTotal: number;

    constructor(data?: Partial<OrderDetail>) {
        this.product = data?.product || new Product();
        this.quantity = data?.quantity || 0;
        this.priceUnit = data?.priceUnit || 0;
        this.subTotal = data?.subTotal || 0;
    }
}

export enum OrderStatus {
    PENDIENTE = 'PENDIENTE',
    PAGADA = 'PAGADA',
    RECHAZADA = 'RECHAZADA'
}