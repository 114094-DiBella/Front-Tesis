export class Order {
    id: string;
    userId: string;
    detalles: DetalleFactura[];
    total: number;
    idFormaPago: string;
    createdAt: Date;
    status: string; // Agregado para el estado de la orden
    
    constructor(id: string, userId: string, detalles: DetalleFactura[], total: number, idFormaPago: string, createdAt: Date, status: string) {
        this.id = id;
        this.userId = userId;
        this.detalles = detalles;
        this.total = total;
        this.idFormaPago = idFormaPago;
        this.createdAt = createdAt;
        this.status = status;
    }

}

export class DetalleFactura {
    id: string;
    idProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;

    constructor(id: string, idProducto: string, cantidad: number, precioUnitario: number, subtotal: number) {
        this.id = id;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }
}