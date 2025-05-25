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

  private categoryImages: {[key: string]: string} = {
    'Jeans': '/images/jeans.jpg',
    'Remeras': '/images/remeras.jpg',
    'Vestidos': '/images/vestidos.jpg',
    'Casual': '/images/casual.jpg'
  };

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
        if (response.length === 0) {
          console.warn('No se encontraron productos.');
          this.products = [];
          return;
        }
        // Filtrar productos activos
        this.products = response.filter((product: Product) => product.active === true);
        if (this.products.length === 0) {
          console.warn('No se encontraron productos activos.');
          return;
        }
        this.products = response;
        console.log('Productos obtenidos:', this.products);
      },
      error: (error) => {
        console.error('Error obteniendo productos:', error);
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

  viewProducts(category: Category) {
    this.router.navigate(['/products', category.id]);
  }

  getCategoryImage(category: Category): string {
    if (!category || !category.name) {
      console.warn('Categoría inválida o sin nombre:', category);
      return 'assets/images/default-category.png';
    }
  
    const image = this.categoryImages[category.name];
    if (!image) {
      console.warn(`No se encontró una imagen para la categoría: ${category.name}`);
      return 'assets/images/default-category.png';
    }
  
    return image;
  }

  viewDetails(product: Product) {
    this.router.navigate(['/products/details', product.id]);
  }

  viewAllProducts() {
    this.router.navigate(['/products']);
  }
  isActive(product: Product): boolean {
    return !!product.active && product.active === true;
  }

}