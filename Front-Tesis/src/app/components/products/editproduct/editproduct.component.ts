import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.services';
import { MarcaService } from '../../../services/marcas.services';
import { Product, Category, Marca, Size } from '../../../models/product.model';
import { ImageUploadComponent } from '../../images/image-upload/image-upload.component';

@Component({
  selector: 'app-editproduct',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ImageUploadComponent
  ],
  templateUrl: './editproduct.component.html',
  styleUrl: './editproduct.component.css'
})
export class EditproductComponent implements OnInit {
  productId: string | null = null;
  productForm!: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isNewProduct: boolean = true;
  
  categories: Category[] = [];
  marcas: Marca[] = [];
  sizeOptions = Object.values(Size);
  
  currentImages: string[] = [];
  currentImageIds: number[] = []; // Para almacenar los IDs de las imágenes actuales
  uploadedImages: any[] = [];
  
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private marcaService = inject(MarcaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadMarcas();
    this.initForm();
    
    // Obtener el ID del producto de la URL, si existe
    this.route.params.subscribe(params => {
      this.productId = params['id'] || null;
      this.isNewProduct = !this.productId;
      
      if (this.productId) {
        this.loadProductData();
      } else {
        this.isLoading = false;
      }
    });
  }
  
  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      marcaId: ['', Validators.required],
      categoryId: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      size: ['', Validators.required],
      color: ['', Validators.required],
      active: [true]
    });
  }
  
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.errorMessage = 'No se pudieron cargar las categorías.';
      }
    });
  }
  
  loadMarcas(): void {
    this.marcaService.getAllMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.errorMessage = 'No se pudieron cargar las marcas.';
      }
    });
  }
  
  loadProductData(): void {
    if (!this.productId) return;
    
    this.isLoading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        // Cargar las imágenes actuales
        if (product.imageUrls && product.imageUrls.length > 0) {
          this.currentImages = [...product.imageUrls];
        }
        
        // Guardar los IDs de las imágenes si están disponibles
        if (product.imageIds && product.imageIds.length > 0) {
          this.currentImageIds = [...product.imageIds];
        }
        
        // Completar el formulario con los datos del producto
        this.productForm.patchValue({
          name: product.name,
          marcaId: product.marca?.id || product.marcaId,
          categoryId: product.category?.id || product.categoryId,
          price: product.price,
          stock: product.stock,
          size: product.size,
          color: product.color,
          active: product.active !== false
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.errorMessage = 'No se pudo cargar la información del producto. Por favor intente de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  onImagesUploaded(images: any[]): void {
    this.uploadedImages = images;
    console.log('Imágenes subidas:', this.uploadedImages);
  }
  
  removeCurrentImage(index: number): void {
    // Eliminar la imagen y su ID correspondiente si existe
    this.currentImages.splice(index, 1);
    if (index < this.currentImageIds.length) {
      this.currentImageIds.splice(index, 1);
    }
  }
  
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }
    
    this.isSubmitting = true;
    const formValues = this.productForm.value;
    
    // Preparar el objeto del producto según el formato requerido por el backend
    const productData: any = {
      name: formValues.name,
      marcaId: formValues.marcaId,
      categoryId: formValues.categoryId,
      price: formValues.price,
      stock: formValues.stock,
      size: formValues.size,
      color: formValues.color,
      active: formValues.active
    };
    
    // Agregar información de imágenes
    if (this.uploadedImages.length > 0) {
      // Si hay nuevas imágenes subidas, usamos sus IDs
      productData.imageIds = this.uploadedImages.map(img => img.imageId);
    } else if (this.currentImageIds.length > 0) {
      // Si no hay nuevas imágenes, mantenemos las existentes
      productData.imageIds = this.currentImageIds;
    } else {
      productData.imageIds = [];
    }
    
    if (this.isNewProduct) {
      this.createProduct(productData);
    } else {
      this.updateProduct(productData);
    }
  }
  
  createProduct(productData: any): void {
    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.successMessage = 'Producto creado correctamente';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        this.errorMessage = 'No se pudo crear el producto. Por favor intente de nuevo.';
        this.isSubmitting = false;
      }
    });
  }
  
  updateProduct(productData: any): void {
    if (!this.productId) return;
    
    this.productService.updateProduct(this.productId, productData).subscribe({
      next: () => {
        this.successMessage = 'Producto actualizado correctamente';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.errorMessage = 'No se pudo actualizar el producto. Por favor intente de nuevo.';
        this.isSubmitting = false;
      }
    });
  }
  
  onCancel(): void {
    this.router.navigate(['/products']);
  }
  
  // Utilidad para marcar todos los campos como tocados
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}