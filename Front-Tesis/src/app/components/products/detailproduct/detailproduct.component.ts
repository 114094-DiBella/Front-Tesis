// detailproduct.component.ts - ACTUALIZADO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({  
  selector: 'app-detailproduct',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './detailproduct.component.html',
  styleUrl: './detailproduct.component.css'
})
export class DetailproductComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentImageIndex: number = 0;
  quantity: number = 1;
  
  // Para mostrar diferentes imágenes si las hay
  selectedImage: string = '';
  
  // Formulario para cantidad
  quantityForm: FormGroup;
  
  // Estado del carrito
  addingToCart: boolean = false;
  addedToCart: boolean = false;
  isInCart: boolean = false;
  
  readonly Array = Array;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService, // ← Nuevo servicio
    private fb: FormBuilder
  ) {
    this.quantityForm = this.fb.group({
      quantity: [1]
    });
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProductDetail(productId);
      } else {
        this.errorMessage = 'ID de producto no proporcionado';
        this.isLoading = false;
      }
    });
    
    // Observar cambios en el formulario de cantidad
    this.quantityForm.get('quantity')?.valueChanges.subscribe(value => {
      this.quantity = value;
    });
  }
  
  loadProductDetail(productId: string): void {
    this.isLoading = true;
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        if (!this.product) {
          this.errorMessage = 'Producto no encontrado';
          this.isLoading = false;
          return;
        }
        
        // Verificar si está en el carrito
        this.checkIfInCart();
        
        // Configurar la imagen seleccionada
        if (this.product.imageUrls && this.product.imageUrls.length > 0) {
          this.selectedImage = this.product.imageUrls[0];
        }
        
        // Cargar productos relacionados (misma categoría)
        if (this.product.category?.id) {
          this.loadRelatedProducts(this.product.category.id, productId);
        }
        console.log('Detalle del producto cargado:', this.product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el detalle del producto:', error);
        this.errorMessage = 'Error al cargar el detalle del producto';
        this.isLoading = false;
      }
    });
  }
  
  loadRelatedProducts(categoryId: string, currentProductId: string): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        // Filtrar por la misma categoría y excluir el producto actual
        this.relatedProducts = products
          .filter((p: Product) => 
            p.category?.id === categoryId && 
            p.id !== currentProductId
          )
          .slice(0, 4); // Limitar a 4 productos relacionados
      },
      error: (error) => {
        console.error('Error al cargar productos relacionados:', error);
      }
    });
  }
  
  selectImage(imageUrl: string, index: number): void {
    this.selectedImage = imageUrl;
    this.currentImageIndex = index;
  }
  
  incrementQuantity(): void {
    const currentValue = this.quantityForm.get('quantity')?.value || 0;
    const maxStock = Number(this.product?.stock) || 0;
    if (currentValue < Math.min(10, maxStock)) { // Limitar al stock disponible o 10
      this.quantityForm.patchValue({ quantity: currentValue + 1 });
    }
  }
  
  decrementQuantity(): void {
    const currentValue = this.quantityForm.get('quantity')?.value || 0;
    if (currentValue > 1) { // No permitir menos de 1
      this.quantityForm.patchValue({ quantity: currentValue - 1 });
    }
  }
  
  // ✅ NUEVA FUNCIÓN - Agregar al carrito
  addToCart(): void {
    if (!this.product) {
      console.error('No hay producto seleccionado');
      return;
    }

    this.addingToCart = true;
    
    const success = this.cartService.addToCart(
      this.product, 
      this.quantity, 
      this.product.size, 
      this.product.color
    );

    if (success) {
      this.addedToCart = true;
      this.isInCart = true;
      
      // Mensaje de éxito temporal
      setTimeout(() => {
        this.addedToCart = false;
      }, 2000);
      
      console.log(`✅ Agregado al carrito: ${this.quantity} x ${this.product.name}`);
    } else {
      console.error('❌ Error al agregar al carrito');
    }
    
    this.addingToCart = false;
  }
  
  // ✅ NUEVA FUNCIÓN - Verificar si está en carrito
  private checkIfInCart(): void {
    if (this.product) {
      this.isInCart = this.cartService.isInCart(
        this.product.id!, 
        this.product.size, 
        this.product.color
      );
    }
  }
  
  // ✅ NUEVA FUNCIÓN - Ir al carrito
  goToCart(): void {
    this.router.navigate(['/orders/new']);
  }
  
  // ✅ NUEVA FUNCIÓN - Verificar stock disponible
  getAvailableStock(): number {
    return Number(this.product?.stock) || 0;
  }
  
  // ✅ NUEVA FUNCIÓN - Verificar si hay stock
  hasStock(): boolean {
    return this.getAvailableStock() > 0;
  }
  
  goBack(): void {
    // Navegar hacia atrás en el historial del navegador
    window.history.back();
  }
  
  goToProduct(product: Product): void {
    // Navegar a otro producto
    this.router.navigate(['/products/details', product.id]);
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}