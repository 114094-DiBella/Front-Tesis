import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { NewOrder } from '../models/newOrder.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    

    constructor(private http: HttpClient) {}

    getOrders() {
        return this.http.get<Order[]>(URL_ORDERS + '/api/facturas/orders');
    }

    getOrderById(id: string) {
        return this.http.get<Order>(`${URL_ORDERS}/api/facturas/${id}`);
    }

    createOrder(order: NewOrder) {
        return this.http.post<NewOrder>(`${URL_ORDERS}/api/facturas`, order);
    }

    updateOrder(id: string, order: NewOrder) {
        return this.http.put<NewOrder>(`${URL_ORDERS}/api/facturas/${id}`, order);
    }

    deleteOrder(id: string) {
        return this.http.delete(`${URL_ORDERS}/api/facturas/${id}`);
    }
}