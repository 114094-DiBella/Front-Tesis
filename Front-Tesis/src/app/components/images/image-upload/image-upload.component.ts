import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageService } from '../../../services/images.services';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent {
  @Input() allowMultiple: boolean = true;
  @Input() allowMainImage: boolean = true;
  @Output() imagesUploaded = new EventEmitter<any[]>();
  
  previewImages: Array<{
    file: File,
    src: string,
    isMain: boolean,
    displayOrder: number
  }> = [];
  
  uploadedImages: any[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;
  isDragOver: boolean = false;
  errorMessage: string = '';
  
  constructor(private imageService: ImageService) {}
  
  onFileSelected(event: any): void {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      const newFiles = Array.from(files) as File[];
      
      for (let i = 0; i < newFiles.length; i++) {
        if (!this.allowMultiple && this.previewImages.length > 0) {
          // Si no se permiten múltiples imágenes, reemplazar la existente
          this.previewImages = [];
        }
        
        this.addImagePreview(newFiles[i]);
      }
    }
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    
    if (files && files.length > 0) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/')) as File[];
      
      for (let i = 0; i < newFiles.length; i++) {
        if (!this.allowMultiple && this.previewImages.length > 0) {
          this.previewImages = [];
        }
        
        this.addImagePreview(newFiles[i]);
      }
    }
  }
  
  addImagePreview(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Determinar si esta imagen debería ser la principal
      const isMain = this.previewImages.length === 0 && this.allowMainImage;
      
      this.previewImages.push({
        file: file,
        src: result,
        isMain: isMain,
        displayOrder: this.previewImages.length
      });
    };
    
    reader.readAsDataURL(file);
  }
  
  removeImage(index: number, event: Event): void {
    event.stopPropagation();
    
    const wasMain = this.previewImages[index].isMain;
    this.previewImages.splice(index, 1);
    
    // Si la imagen eliminada era la principal, establecer la primera como principal
    if (wasMain && this.previewImages.length > 0 && this.allowMainImage) {
      this.previewImages[0].isMain = true;
    }
    
    // Actualizar displayOrder
    this.previewImages.forEach((preview, i) => {
      preview.displayOrder = i;
    });
  }
  
  setMainImage(index: number, event: Event): void {
    event.stopPropagation();
    
    // Quitar estado principal de todas las imágenes
    this.previewImages.forEach(preview => {
      preview.isMain = false;
    });
    
    // Establecer la imagen seleccionada como principal
    this.previewImages[index].isMain = true;
  }
  
  uploadImages(): void {
    if (this.previewImages.length === 0) {
      this.errorMessage = 'No hay imágenes para subir';
      return;
    }
    
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadedImages = [];
    this.errorMessage = '';
    
    const totalImages = this.previewImages.length;
    let uploadedCount = 0;
    
    this.previewImages.forEach((preview, index) => {
      this.imageService.uploadBase64Image(
        preview.file, 
        preview.isMain, 
        preview.displayOrder
      ).subscribe({
        next: (response) => {
          this.uploadedImages.push({
            ...response,
            name: preview.file.name // Agregar el nombre del archivo para mostrarlo en la UI
          });
          uploadedCount++;
          this.uploadProgress = (uploadedCount / totalImages) * 100;
          
          if (uploadedCount === totalImages) {
            this.finishUpload();
          }
        },
        error: (error) => {
          console.error('Error al subir la imagen:', error);
          this.errorMessage = 'Error al subir la imagen. Intente de nuevo.';
          this.isUploading = false;
        }
      });
    });
  }
  
  finishUpload(): void {
    this.isUploading = false;
    this.previewImages = [];
    this.imagesUploaded.emit(this.uploadedImages);
  }
  
  cancelUpload(): void {
    this.previewImages = [];
    this.uploadProgress = 0;
    this.errorMessage = '';
  }
}