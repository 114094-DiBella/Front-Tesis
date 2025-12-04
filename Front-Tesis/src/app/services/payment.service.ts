// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../models/payment.models';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) {}

  // Obtener todos los métodos de pago activos
  getActivePaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${URL_PAYMENT_METHODS}/api/formas-pago/active`);
  }

  // Obtener método de pago por ID
  getPaymentMethodById(id: string): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${URL_PAYMENT_METHODS}/api/formas-pago/${id}`);
  }

  // Obtener todos los métodos (para admin)
  getAllPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(URL_PAYMENT_METHODS + `/api/formas-pago`);
  }
}