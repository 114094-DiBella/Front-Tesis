import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class CategoryService{
    private apiUrl = environment.URL_PRODUCTS;
    constructor(private http: HttpClient) { }
    
    getAllCategories(): Observable<Category[]> {
        console.log("URL_PRODUCTS", this.apiUrl);
        return this.http.get<Category[]>(this.apiUrl + "/api/categories");
    }

    createCategory(category: Category): Observable<any> {
        return this.http.post(this.apiUrl + "/api/categories", category);
    }

    updateCategory(id: string, category: Category): Observable<any> {
        return this.http.put(`${this.apiUrl}/api/categories/${id}`, category);
    }

    deleteCategory(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/api/categories/${id}`);
    }
    getCategoryById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/categories/${id}`);
    }



}  