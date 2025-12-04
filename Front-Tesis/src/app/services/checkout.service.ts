import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  


  constructor(private http: HttpClient) { }

  createCheckout(checkoutData: any): Observable<any> {
    return this.http.post(`${URL_PAYMENT_METHODS}/api/checkout/create`, checkoutData);
  }
  
}