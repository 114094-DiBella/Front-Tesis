import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

const URL_NOTIFY = "http://localhost:8083/api/notifications";

@Injectable({
    providedIn: 'root'
  })
  export class NotifyService {
    constructor(private http: HttpClient) {}

    sendNotification(data: any): Observable<any> {
      return this.http.post(URL_NOTIFY, data);
    }
  }