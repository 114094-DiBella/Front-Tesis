import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { NewOrder } from '../models/newOrder.model';

const URL_ORDERS = 'http://localhost:8081/api/facturas';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    

    constructor(private http: HttpClient) {}

    getOrders() {
        return this.http.get<Order[]>(URL_ORDERS + '/orders');
    }

    getOrderById(id: string) {
        return this.http.get<Order>(`${URL_ORDERS}/${id}`);
    }

    createOrder(order: NewOrder) {
        return this.http.post<NewOrder>(URL_ORDERS, order);
    }

    updateOrder(id: string, order: NewOrder) {
        return this.http.put<NewOrder>(`${URL_ORDERS}/${id}`, order);
    }

    deleteOrder(id: string) {
        return this.http.delete(`${URL_ORDERS}/${id}`);
    }
}