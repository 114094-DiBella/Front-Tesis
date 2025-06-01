// receipt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  
  private readonly API_URL = 'http://localhost:8081/api/receipts';

  constructor(private http: HttpClient) {}

  /**
   * Descarga el comprobante en PDF
   */
  downloadReceipt(orderCode: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(`${this.API_URL}/download/${orderCode}`, {
      headers,
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Vista previa del comprobante
   */
  previewReceipt(orderCode: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(`${this.API_URL}/preview/${orderCode}`, {
      headers,
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Verificar estado del comprobante
   */
  checkReceiptStatus(orderCode: string): Observable<any> {
    return this.http.get(`${this.API_URL}/status/${orderCode}`);
  }
}