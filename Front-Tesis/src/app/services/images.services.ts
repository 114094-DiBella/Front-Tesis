import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/dev';
export interface Base64ImageDTO {
  base64Image: string;
  fileName: string;
  fileType: string;
  isMain: boolean;
  displayOrder: number;
}

export interface ImageResponse {
  imageUrl: string;
  imageId: string;
  base64Image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
 private apiUrl = environment.URL_PRODUCTS;

  constructor(private http: HttpClient) { }

  // Método para subir una imagen como archivo
  uploadImage(file: File): Observable<ImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<ImageResponse>(`${this.apiUrl}/api/images/upload`, formData);
  }

  // Método para subir una imagen como Base64
  uploadBase64Image(imageFile: File, isMain: boolean = false, displayOrder: number = 0): Observable<ImageResponse> {
    return new Observable((observer) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        
        const imageDTO: Base64ImageDTO = {
          base64Image: base64Image,
          fileName: imageFile.name,
          fileType: imageFile.type,
          isMain: isMain,
          displayOrder: displayOrder
        };
        
        this.http.post<ImageResponse>(`${this.apiUrl}/api/images/upload-base64`, imageDTO).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };
      
      reader.onerror = (e) => {
        observer.error('Error al leer el archivo');
      };
      
      reader.readAsDataURL(imageFile);
    });
  }

  // Método para obtener una imagen en formato Base64
  getImageAsBase64(id: string): Observable<ImageResponse> {
    return this.http.get<ImageResponse>(`${this.apiUrl}/api/images/get-base64/${id}`);
  }
}