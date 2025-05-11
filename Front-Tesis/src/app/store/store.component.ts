import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Category, Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.services';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  featuredCategories: Category[] = [];
  
  @ViewChild('productCarousel') productCarousel!: ElementRef<HTMLDivElement>;
  @ViewChild('categoryCarousel') categoryCarousel!: ElementRef<HTMLDivElement>;
  
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() { }

  ngOnInit(): void {
    this.getAllProducts();
    this.getFeaturedCategories();
  }
  
  ngAfterViewInit(): void {
    // Configuración adicional del carrusel después de que la vista se ha iniciado
  }

  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        // Procesar las URLs de las imágenes
        this.products = response.map((product: Product) => {
          if (product.imageUrls) {
            product.imageUrls = product.imageUrls.map((url: string) => {
              // Si la URL comienza con "/images/", agregarle el prefijo del backend
              if (url.startsWith('/images/')) {
                return 'http://localhost:8080' + url;
              }
              return url;
            });
          }
          return product;
        });
        console.log('Products processed:', this.products);
      },
      error: (error) => {
        console.error('Error obtaining products:', error);
      }
    });
  }

  // Métodos para el carrusel de categorías
  scrollCategoryPrev() {
    if (this.categoryCarousel) {
      const scrollAmount = this.categoryCarousel.nativeElement.offsetWidth;
      this.categoryCarousel.nativeElement.scrollLeft -= scrollAmount;
    }
  }

  scrollCategoryNext() {
    if (this.categoryCarousel) {
      const scrollAmount = this.categoryCarousel.nativeElement.offsetWidth;
      this.categoryCarousel.nativeElement.scrollLeft += scrollAmount;
    }
  }

  // Métodos para el carrusel de productos
  scrollProductPrev() {
    if (this.productCarousel) {
      const scrollAmount = this.productCarousel.nativeElement.offsetWidth;
      this.productCarousel.nativeElement.scrollLeft -= scrollAmount;
    }
  }

  scrollProductNext() {
    if (this.productCarousel) {
      const scrollAmount = this.productCarousel.nativeElement.offsetWidth;
      this.productCarousel.nativeElement.scrollLeft += scrollAmount;
    }
  }

  // Método para navegar al catálogo completo
  viewCatalog() {
    this.router.navigate(['/catalog']);
  }

  getFeaturedCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        // Filtrar las categorías destacadas
        this.featuredCategories = response.filter((category: Category) => category.image_url !== null);
        console.log('Featured categories:', this.featuredCategories);
      },
      error: (error) => {
        console.error('Error obtaining categories:', error);
      }
    });
  }
}