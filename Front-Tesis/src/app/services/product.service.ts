import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const URL_PRODUCTS = "http://localhost:8080/api/products";

@Injectable({
    providedIn: 'root'
  })

export class ProductService{

    constructor(private http: HttpClient) { }
    
    getAllProducts(): Observable<any> {
        return this.http.get(URL_PRODUCTS);
    }

    createProduct(product: any): Observable<any> {
        return this.http.post(URL_PRODUCTS, product);
    }

    updateProduct(id: string, product: any): Observable<any> {
        return this.http.put(`${URL_PRODUCTS}/${id}`, product);
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${URL_PRODUCTS}/${id}`);
    }
    getProductById(id: string): Observable<any> {
        return this.http.get(`${URL_PRODUCTS}/${id}`);
    }
    
}