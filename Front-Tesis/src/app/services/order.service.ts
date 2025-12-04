import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { NewOrder } from '../models/newOrder.model';
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = environment.URL_ORDERS;

    constructor(private http: HttpClient) {}

    getOrders() {
        return this.http.get<Order[]>(this.apiUrl + '/api/facturas/orders');
    }

    getOrderById(id: string) {
        return this.http.get<Order>(`${this.apiUrl}/api/facturas/${id}`);
    }

    createOrder(order: NewOrder) {
        return this.http.post<NewOrder>(`${this.apiUrl}/api/facturas`, order);
    }

    updateOrder(id: string, order: NewOrder) {
        return this.http.put<NewOrder>(`${this.apiUrl}/api/facturas/${id}`, order);
    }

    deleteOrder(id: string) {
        return this.http.delete(`${this.apiUrl}/api/facturas/${id}`);
    }
}