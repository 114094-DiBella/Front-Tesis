import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  
  private apiUrl = 'http://localhost:8081/api/checkout';

  constructor(private http: HttpClient) { }

  createCheckout(checkoutData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, checkoutData);
  }
  
}