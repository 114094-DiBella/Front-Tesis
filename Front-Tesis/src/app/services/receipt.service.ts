// receipt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  
  private apiUrl = environment.URL_ORDERS;

  constructor(private http: HttpClient) {}

  /**
   * Descarga el comprobante en PDF
   */
  downloadReceipt(orderCode: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(`${this.apiUrl}/api/receipts/download/${orderCode}`, {
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

    return this.http.get(`${this.apiUrl}/api/receipts/preview/${orderCode}`, {
      headers,
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Verificar estado del comprobante
   */
  checkReceiptStatus(orderCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/receipts/status/${orderCode}`);
  }
}