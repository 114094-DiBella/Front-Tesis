import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/product.model';
const URL_CATEGORY = "http://localhost:8080/api/categories"

@Injectable({
    providedIn: 'root'
  })
export class CategoryService{
    constructor(private http: HttpClient) { }
    
    getAllCategories(): Observable<Category[]> {
        console.log("URL_CATEGORY", URL_CATEGORY);
        return this.http.get<Category[]>(URL_CATEGORY);
    }

    createCategory(category: Category): Observable<any> {
        return this.http.post(URL_CATEGORY, category);
    }

    updateCategory(id: string, category: Category): Observable<any> {
        return this.http.put(`${URL_CATEGORY}/${id}`, category);
    }

    deleteCategory(id: string): Observable<any> {
        return this.http.delete(`${URL_CATEGORY}/${id}`);
    }
    getCategoryById(id: string): Observable<any> {
        return this.http.get(`${URL_CATEGORY}/${id}`);
    }



}  