// receipt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  
  

  constructor(private http: HttpClient) {}

  /**
   * Descarga el comprobante en PDF
   */
  downloadReceipt(orderCode: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(`${URL_ORDERS}/api/receipts/download/${orderCode}`, {
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

    return this.http.get(`${URL_ORDERS}/api/receipts/preview/${orderCode}`, {
      headers,
      responseType: 'blob',
      observe: 'response'
    });
  }

  /**
   * Verificar estado del comprobante
   */
  checkReceiptStatus(orderCode: string): Observable<any> {
    return this.http.get(`${URL_ORDERS}/api/receipts/status/${orderCode}`);
  }
}