import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';

const URL_PRODUCTS = "http://localhost:8080/api/products";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private http: HttpClient) { }
    
    // Método para obtener todos los productos con procesamiento de URLs de imágenes
    getAllProducts(): Observable<any> {
        return this.http.get(URL_PRODUCTS).pipe(
            map((products: any) => {
                if (Array.isArray(products)) {
                    return products.map(product => this.processImageUrls(product));
                }
                return products;
            })
        );
    }

    createProduct(product: any): Observable<any> {
        return this.http.post(URL_PRODUCTS, product);
    }

    updateProduct(id: string, product: any): Observable<any> {
        console.log('Updating product with ID:', id);
        console.log('Product data:', product);
        return this.http.put(`${URL_PRODUCTS}/${id}`, product);
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${URL_PRODUCTS}/${id}`);
    }
    
    getProductById(id: string): Observable<any> {
        return this.http.get(`${URL_PRODUCTS}/${id}`).pipe(
            map(product => this.processImageUrls(product))
        );
    }

    processImageUrls(product: Product): Product {
        if (product.imageUrls) {
            if (Array.isArray(product.imageUrls)) {
                // Si es un array, procesamos cada URL
                product.imageUrls = product.imageUrls.map((url: string) => {
                    if (url && typeof url === 'string' && url.startsWith('/images/')) {
                        return 'http://localhost:8080' + url;
                    }
                    return url;
                });
            } else {
                // Si no es un array pero tiene un valor, asumimos que es un string
                // Necesitamos hacer una conversión de tipo para indicar a TypeScript que sabemos lo que hacemos
                const imageUrl = product.imageUrls as unknown as string;
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/images/')) {
                    // También necesitamos una conversión de tipo aquí
                    product.imageUrls = ['http://localhost:8080' + imageUrl] as unknown as string[];
                } else if (typeof imageUrl === 'string') {
                    // Convertir a array si es un string
                    product.imageUrls = [imageUrl] as unknown as string[];
                }
            }
        }
        return product;
    }
}