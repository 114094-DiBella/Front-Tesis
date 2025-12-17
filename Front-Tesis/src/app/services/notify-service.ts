import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
  export class NotifyService {
    constructor(private http: HttpClient) {}

    private apiUrl = environment.URL_NOTIFY;

    sendNotification(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/notifications`, data);
    }

    sendNewsletterWelcome(email: string): Observable<any> {
      const params = new HttpParams().set('email', email);
      return this.http.post(`${this.apiUrl}/api/notifications/newsletter-welcome`, null, { params });
    }
  }