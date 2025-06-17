import { Component, inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Category, Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.services';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, OnDestroy {
  // === DATOS === //
  products: Product[] = [];
  featuredCategories: Category[] = [];
  lowPriceHero: number = 20000.00;

  // === CARRUSEL AUTO-SCROLL === //
  currentCategoryIndex = 0;
  autoScrollInterval: any;
  isAutoScrollPaused = false;

  // === VIEW CHILDREN === //
  @ViewChild('categoryCarousel') categoryCarousel!: ElementRef<HTMLDivElement>;

  // === SERVICIOS === //
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  // === MAPEO DE IMÁGENES === //
  private categoryImages: {[key: string]: string} = {
    'Jeans': '/images/jeans.jpg',
    'Remeras': '/images/remeras.jpg',
    'Vestidos': '/images/vestidos.jpg',
    'Casual': '/images/casual.jpg',
    'Abrigos': '/images/abrigos.jpeg',
    'Sweaters': '/images/sweeater.jpg',
    'Pantalones': '/images/pantalones.jpg',
    'Camisas': '/images/camisas.jpg',
    'Chombas': '/images/chombas.jpg',
    'Camperas': '/images/camperas.jpg'
  };

  constructor() { }

  ngOnInit(): void {
    this.getAllProducts();
    this.getFeaturedCategories();
    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  // ===== OBTENER DATOS ===== //
  
  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.length === 0) {
          this.products = [];
          return;
        }
        
        const activeProducts = response.filter((product: Product) => product.active === true);
        this.products = activeProducts.slice(0, 8); // Solo 8 productos destacados
      },
      error: (error) => {
        console.error('Error obteniendo productos:', error);
        this.products = [];
      }
    });
  }

  getFeaturedCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.featuredCategories = response.slice(0, 6); // Máximo 6 categorías
      },
      error: (error) => {
        console.error('Error obteniendo categorías:', error);
        this.featuredCategories = [];
      }
    });
  }

  // ===== AUTO-SCROLL CARRUSEL ===== //
  
  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (!this.isAutoScrollPaused) {
        this.nextSlide();
      }
    }, 5000);
  }
  
  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }
  
  pauseAutoScroll() {
    this.isAutoScrollPaused = true;
    setTimeout(() => {
      this.isAutoScrollPaused = false;
    }, 10000);
  }

  // ===== NAVEGACIÓN CARRUSEL ===== //
  
  nextSlide() {
    const totalSlides = this.featuredCategories.length;
    this.currentCategoryIndex = (this.currentCategoryIndex + 1) % totalSlides;
    this.updateCarouselPosition();
  }
  
  prevSlide() {
    const totalSlides = this.featuredCategories.length;
    this.currentCategoryIndex = this.currentCategoryIndex === 0 
      ? totalSlides - 1 
      : this.currentCategoryIndex - 1;
    this.updateCarouselPosition();
  }
  
  goToSlide(index: number) {
    this.currentCategoryIndex = index;
    this.updateCarouselPosition();
    this.pauseAutoScroll();
  }
  
  updateCarouselPosition() {
    if (this.categoryCarousel?.nativeElement) {
      const carousel = this.categoryCarousel.nativeElement;
      const cardWidth = 350;
      const gap = 30;
      const scrollPosition = this.currentCategoryIndex * (cardWidth + gap);
      
      carousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }

  // ===== CONTROLES MANUALES CARRUSEL ===== //
  
  scrollCategoryPrev() {
    this.prevSlide();
    this.pauseAutoScroll();
  }

  scrollCategoryNext() {
    this.nextSlide();
    this.pauseAutoScroll();
  }

  // ===== EVENTOS DE MOUSE ===== //
  
  onCarouselMouseEnter() {
    this.isAutoScrollPaused = true;
  }
  
  onCarouselMouseLeave() {
    this.isAutoScrollPaused = false;
  }

  onCarouselScroll() {
    if (this.categoryCarousel?.nativeElement) {
      const carousel = this.categoryCarousel.nativeElement;
      const cardWidth = 350 + 30;
      const scrollLeft = carousel.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      
      if (newIndex !== this.currentCategoryIndex && newIndex < this.featuredCategories.length) {
        this.currentCategoryIndex = newIndex;
      }
    }
  }

  // ===== NAVEGACIÓN ===== //
  
  viewCatalog() {
    this.router.navigate(['/products']);
  }

  viewProducts(category: Category) {
    this.router.navigate(['/products', category.id]);
  }

  filterProducts(searchText: string) {
    this.router.navigate(['/products'], { queryParams: { search: searchText } });
  }

  viewDetails(product: Product) {
    this.router.navigate(['/products/details', product.id]);
  }

  viewAllProducts() {
    this.router.navigate(['/products']);
  }

  // ===== UTILIDADES ===== //
  
  getCategoryImage(category: Category): string {
    if (!category?.name) {
      return '/images/default-category.png';
    }
    
    const image = this.categoryImages[category.name];
    return image || '/images/default-category.png';
  }

  // ===== FUNCIONES ADICIONALES OPCIONALES ===== //
  
  quickAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    
    console.log('Agregando al carrito:', product.name);
    
    // Feedback visual
    const button = event.target as HTMLElement;
    const originalText = button.textContent;
    button.textContent = '¡AGREGADO!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 2000);
  }
}