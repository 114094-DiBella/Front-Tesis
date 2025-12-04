import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/dev';
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  

  private apiUrl = environment.URL_PAYMENT_METHODS;
  constructor(private http: HttpClient) { }

  createCheckout(checkoutData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/checkout/create`, checkoutData);
  }
  
}