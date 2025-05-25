import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

const URL_ORDERS = 'http://localhost:8081/api/facturas';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    

    constructor(private http: HttpClient) {}

    getOrders() {
        return this.http.get<Order[]>(URL_ORDERS);
    }

    getOrderById(id: string) {
        return this.http.get<Order>(`${URL_ORDERS}/${id}`);
    }

    createOrder(order: Order) {
        return this.http.post<Order>(URL_ORDERS, order);
    }

    updateOrder(id: string, order: Order) {
        return this.http.put<Order>(`${URL_ORDERS}/${id}`, order);
    }

    deleteOrder(id: string) {
        return this.http.delete(`${URL_ORDERS}/${id}`);
    }
}