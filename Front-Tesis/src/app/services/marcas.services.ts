import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Marca } from "../models/product.model";
import { Observable } from "rxjs";

const URL_MARCA = "http://localhost:8080/api/marcas"

@Injectable({
    providedIn: 'root'
  })
export class MarcaService{
    constructor(private http: HttpClient) { }
    
    getAllMarcas(): Observable<Marca[]> {
        console.log("URL_MARCA", URL_MARCA);
        return this.http.get<Marca[]>(URL_MARCA);
    }

    createMarca(marca: Marca): Observable<any> {
        return this.http.post(URL_MARCA, marca);
    }

    updateMarca(id: string, marca: Marca): Observable<any> {
        return this.http.put(`${URL_MARCA}/${id}`, marca);
    }

    deleteMarca(id: string): Observable<any> {
        return this.http.delete(`${URL_MARCA}/${id}`);
    }
    getMarcaById(id: string): Observable<any> {
        return this.http.get(`${URL_MARCA}/${id}`);
    }
}
