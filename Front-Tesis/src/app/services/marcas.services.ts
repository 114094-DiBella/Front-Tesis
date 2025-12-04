import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Marca } from "../models/product.model";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class MarcaService{
    private apiUrl = environment.URL_PRODUCTS;
    constructor(private http: HttpClient) { }
    
    getAllMarcas(): Observable<Marca[]> {
        console.log("URL_PRODUCTS", this.apiUrl);
        return this.http.get<Marca[]>(`${this.apiUrl}/api/marcas`);
    }

    createMarca(marca: Marca): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/marcas`, marca);
    }

    updateMarca(id: string, marca: Marca): Observable<any> {
        return this.http.put(`${this.apiUrl}/api/marcas/${id}`, marca);
    }

    deleteMarca(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/api/marcas/${id}`);
    }
    getMarcaById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/marcas/${id}`);
    }
}
