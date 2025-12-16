import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, Marca, Size } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.services';
import { ImageService } from '../../../services/images.services';

import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from '../../images/image-upload/image-upload.component';
import { MarcaService } from '../../../services/marcas.services';

@Component({
  selector: 'app-alta-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageUploadComponent
  ],
  templateUrl: './altaproduct.component.html',
  styleUrl: './altaproduct.component.css'
})
export class AltaproductComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  marcas: Marca[] = [];
  
  // Usamos el enum Size directamente
  sizes = Object.values(Size);
  
  isEditing = false;
  productId: string | null = null;
  uploadedImages: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private router: Router,
    private route: ActivatedRoute,
    private marcaService: MarcaService
  ) { }
  
  ngOnInit(): void {
    this.productForm = this.createForm();
    this.loadCategories();
    this.loadMarcas(); 
    
    // Comprobar si estamos editando un producto existente
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditing = true;
      this.loadProduct(this.productId);
    }
  }
  
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      marcaId: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', [Validators.maxLength(2000)]],
      size: ['', Validators.required],
      color: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
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
        this.errorMessage = 'Error al cargar categorías. Por favor, intente nuevamente.';
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
        this.errorMessage = 'Error al cargar marcas. Por favor, intente nuevamente.';
      }
    });
  }
  
  loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          marcaId: product.marca?.id,
          categoryId: product.category?.id,
          description: product.description || product.descripcion || '', // fallback for backend Spanish naming
          size: product.size,
          color: product.color,
          price: product.price,
          stock: product.stock,
          active: product.active,
        });
        
        // Si el producto tiene imágenes, cargarlas
        if (product.imageUrls && product.imageUrls.length > 0) {
          this.uploadedImages = product.imageUrls.map((url: string, index: number) => ({
            imageUrl: url,
            imageId: `existing-${index}`,
            name: `Imagen ${index + 1}`
          }));
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el producto:', error);
        this.errorMessage = 'Error al cargar el producto. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }
  
  onImagesUploaded(images: any[]): void {
    // Añadir las nuevas imágenes a las ya existentes
    this.uploadedImages = [...this.uploadedImages, ...images];
    console.log('Imágenes subidas:', this.uploadedImages);
  }
  
  onSubmit(): void {
    // Limpiar mensajes previos
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }
    
    if (this.uploadedImages.length === 0) {
      this.errorMessage = 'Debe subir al menos una imagen para el producto';
      return;
    }
    
    const formData = this.productForm.value;
    
    // Extraer los IDs de las imágenes subidas
    const imageIds = this.uploadedImages
      .filter(img => img.imageId && !img.imageId.startsWith('existing-'))
      .map(img => img.imageId);
    
    const productData = {
      ...formData,
      description: formData.description ?? '',
      descripcion: formData.description ?? '', // include Spanish key for backend
      imageIds: imageIds
    }; // productData contains both description (from form) and descripcion (for backend compatibility)
    
    console.log('Datos del producto a enviar (altaproduct):', JSON.stringify(productData, null, 2));
    
    this.isLoading = true;
    
    if (this.isEditing && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = '¡Producto actualizado con éxito!';
          
          // Redirigir después de 2 segundos para que el usuario vea el mensaje
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar el producto:', error);
          this.errorMessage = 'Error al actualizar el producto. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = '¡Producto creado con éxito!';
          
          // Redirigir después de 2 segundos para que el usuario vea el mensaje
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al crear el producto:', error);
          this.errorMessage = 'Error al crear el producto. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });
    }
  }
  
  removeExistingImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/products']);
  }
}