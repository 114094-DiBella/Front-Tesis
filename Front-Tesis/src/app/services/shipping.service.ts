// shipping.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface ShippingAddress {
  street: string;
  streetNumber: string;
  city: string;
  province: string;
  postalCode: string;
  apartment?: string;
  floor?: string;
}

export interface QuoteRequest {
  originAddress: ShippingAddress;
  destinationAddress: ShippingAddress;
  weightKg: number;
  declaredValue: number;
}

export interface ShippingQuote {
  carrierId: string;
  carrierName: string;
  serviceType: string;
  price: number;
  estimatedDays: number;
  description: string;
}

export interface CreateShipmentRequest {
  orderCode: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: ShippingAddress;
  serviceType: string;
  weightKg: number;
  declaredValue: number;
}

export interface ShipmentResponse {
  id: string;
  orderCode: string;
  trackingNumber?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: ShippingAddress;
  serviceType: string;
  weightKg: number;
  declaredValue: number;
  shippingCost?: number;
  status: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  trackingEvents?: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  eventDate: string;
  location: string;
  description: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  
  private apiUrl = environment.URL_SHIPPING;
  constructor(private http: HttpClient) {}

  /**
   * Obtener cotizaciones de envío
   */
  getShippingQuotes(request: QuoteRequest): Observable<ShippingQuote[]> {
    return this.http.post<ShippingQuote[]>(`${this.apiUrl}/api/shipping/quotes`, request);
  }

  /**
   * Crear un envío
   */
  createShipment(request: CreateShipmentRequest): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(`${this.apiUrl}/api/shipping/create`, request);
  }

  /**
   * Obtener envío por código de orden
   */
  getShipmentByOrderCode(orderCode: string): Observable<ShipmentResponse> {
    return this.http.get<ShipmentResponse>(`${this.apiUrl}/api/shipping/order/${orderCode}`);
  }

  /**
   * Rastrear envío por número de tracking
   */
  trackShipment(trackingNumber: string): Observable<ShipmentResponse> {
    return this.http.get<ShipmentResponse>(`${this.apiUrl}/api/shipping/track/${trackingNumber}`);
  }

  /**
   * Cancelar envío
   */
  cancelShipment(orderCode: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/shipping/order/${orderCode}`);
  }

  /**
   * Verificar estado del servicio
   */
  checkServiceHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/shipping/health`);
  }

  /**
   * Actualizar tracking manualmente
   */
  updateTracking(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/shipping/update-tracking`, {});
  }
}