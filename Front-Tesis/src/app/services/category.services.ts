import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/product.model';


@Injectable({
    providedIn: 'root'
  })
export class CategoryService{
    constructor(private http: HttpClient) { }
    
    getAllCategories(): Observable<Category[]> {
        console.log("URL_PRODUCTS", URL_PRODUCTS);
        return this.http.get<Category[]>(URL_PRODUCTS + "/api/categories");
    }

    createCategory(category: Category): Observable<any> {
        return this.http.post(URL_PRODUCTS + "/api/categories", category);
    }

    updateCategory(id: string, category: Category): Observable<any> {
        return this.http.put(`${URL_PRODUCTS}/api/categories/${id}`, category);
    }

    deleteCategory(id: string): Observable<any> {
        return this.http.delete(`${URL_PRODUCTS}/api/categories/${id}`);
    }
    getCategoryById(id: string): Observable<any> {
        return this.http.get(`${URL_PRODUCTS}/api/categories/${id}`);
    }



}  