import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Marca } from "../models/product.model";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root'
  })
export class MarcaService{
    constructor(private http: HttpClient) { }
    
    getAllMarcas(): Observable<Marca[]> {
        console.log("URL_PRODUCTS", URL_PRODUCTS);
        return this.http.get<Marca[]>(`${URL_PRODUCTS}/api/marcas`);
    }

    createMarca(marca: Marca): Observable<any> {
        return this.http.post(`${URL_PRODUCTS}/api/marcas`, marca);
    }

    updateMarca(id: string, marca: Marca): Observable<any> {
        return this.http.put(`${URL_PRODUCTS}/api/marcas/${id}`, marca);
    }

    deleteMarca(id: string): Observable<any> {
        return this.http.delete(`${URL_PRODUCTS}/api/marcas/${id}`);
    }
    getMarcaById(id: string): Observable<any> {
        return this.http.get(`${URL_PRODUCTS}/api/marcas/${id}`);
    }
}
