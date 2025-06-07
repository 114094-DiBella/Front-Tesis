import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
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
export class StoreComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[] = [];
  featuredCategories: Category[] = [];
  
  @ViewChild('productCarousel') productCarousel!: ElementRef<HTMLDivElement>;
  @ViewChild('categoryCarousel') categoryCarousel!: ElementRef<HTMLDivElement>;
  
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Mapeo de imágenes para categorías (ampliado)
  private categoryImages: {[key: string]: string} = {
    'Jeans': '/images/jeans.jpg',
    'Remeras': '/images/remeras.jpg',
    'Vestidos': '/images/vestidos.jpg',
    'Casual': '/images/casual.jpg',
    'Abrigos': '/images/abrigos.jpg',
    'Sweaters': '/images/sweaters.jpg',
    'Pantalones': '/images/pantalones.jpg',
    'Camisas': '/images/camisas.jpg',
    'Chombas': '/images/chombas.jpg',
    'Camperas': '/images/camperas.jpg'
  };

  // Variables para efectos modernos
  private scrollListener?: () => void;
  private intersectionObserver?: IntersectionObserver;
  private isScrolling = false;

  constructor() { }

  ngOnInit(): void {
    this.getAllProducts();
    this.getFeaturedCategories();
    this.initializeModernEffects();
  }
  
  ngAfterViewInit(): void {
    // Configuración adicional después de que la vista se ha iniciado
    this.setupIntersectionObserver();
    this.initializeCarouselEffects();
  }

  ngOnDestroy(): void {
    // Limpiar listeners y observers
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  // ===== EFECTOS MODERNOS =====
  initializeModernEffects(): void {
    // Configurar scroll listener para efectos parallax
    this.scrollListener = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    
    // Configurar smooth scroll para navegación
    this.setupSmoothScrolling();
  }

  handleScroll(): void {
    if (this.isScrolling) return;
    
    this.isScrolling = true;
    requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero-background') as HTMLElement;
      
      if (hero) {
        // Efecto parallax sutil en el hero
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
      
      // Efecto fade en el scroll indicator
      const scrollIndicator = document.querySelector('.scroll-indicator') as HTMLElement;
      if (scrollIndicator) {
        const opacity = Math.max(0, 1 - (scrolled / 300));
        scrollIndicator.style.opacity = opacity.toString();
      }
      
      this.isScrolling = false;
    });
  }

  setupSmoothScrolling(): void {
    // Configurar scroll suave para los links internos
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-scroll-to]')) {
        e.preventDefault();
        const targetId = target.getAttribute('data-scroll-to');
        const targetElement = document.getElementById(targetId!);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  setupIntersectionObserver(): void {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Agregar delay escalonado para elementos en grid
          const index = Array.from(entry.target.parentNode?.children || []).indexOf(entry.target);
          (entry.target as HTMLElement).style.animationDelay = `${index * 0.1}s`;
        }
      });
    }, options);

    // Observar elementos para animaciones
    setTimeout(() => {
      document.querySelectorAll('.product-card, .category-card, .section-title, .kpi-card').forEach(el => {
        this.intersectionObserver?.observe(el);
      });
    }, 100);
  }

  initializeCarouselEffects(): void {
    // Configurar auto-scroll para carruseles (opcional)
    this.setupCarouselAutoScroll();
  }

  setupCarouselAutoScroll(): void {
    // Auto-scroll sutil cada 5 segundos (se pausa en hover)
    const carousels = [this.productCarousel, this.categoryCarousel];
    
    carousels.forEach(carousel => {
      if (carousel?.nativeElement) {
        let autoScrollInterval: any;
        
        const startAutoScroll = () => {
          autoScrollInterval = setInterval(() => {
            const element = carousel.nativeElement;
            const maxScroll = element.scrollWidth - element.clientWidth;
            
            if (element.scrollLeft >= maxScroll) {
              element.scrollLeft = 0;
            } else {
              element.scrollLeft += 320; // Ancho de una tarjeta aprox
            }
          }, 5000);
        };
        
        const stopAutoScroll = () => {
          if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
          }
        };
        
        // Eventos para pausar/reanudar auto-scroll
        carousel.nativeElement.addEventListener('mouseenter', stopAutoScroll);
        carousel.nativeElement.addEventListener('mouseleave', startAutoScroll);
        
        // Iniciar auto-scroll
        startAutoScroll();
      }
    });
  }

  // ===== MÉTODOS DE DATOS =====
  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.length === 0) {
          console.warn('No se encontraron productos.');
          this.products = [];
          return;
        }
        
        // Filtrar productos activos y tomar una muestra para destacados
        const activeProducts = response.filter((product: Product) => product.active === true);
        
        if (activeProducts.length === 0) {
          console.warn('No se encontraron productos activos.');
          this.products = [];
          return;
        }
        
        // Tomar los primeros 8 productos para la sección destacados
        this.products = activeProducts.slice(0, 8);
        console.log('Productos destacados obtenidos:', this.products);
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
        // Tomar todas las categorías disponibles
        this.featuredCategories = response.slice(0, 6); // Limitar a 6 para mejor UX
        console.log('Categorías destacadas:', this.featuredCategories);
      },
      error: (error) => {
        console.error('Error obtaining categories:', error);
        this.featuredCategories = [];
      }
    });
  }

  // ===== MÉTODOS DE CARRUSEL =====
  scrollCategoryPrev() {
    if (this.categoryCarousel?.nativeElement) {
      const element = this.categoryCarousel.nativeElement;
      const scrollAmount = element.clientWidth * 0.8; // Scroll 80% del ancho visible
      element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollCategoryNext() {
    if (this.categoryCarousel?.nativeElement) {
      const element = this.categoryCarousel.nativeElement;
      const scrollAmount = element.clientWidth * 0.8;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  scrollProductPrev() {
    if (this.productCarousel?.nativeElement) {
      const element = this.productCarousel.nativeElement;
      const scrollAmount = element.clientWidth * 0.8;
      element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollProductNext() {
    if (this.productCarousel?.nativeElement) {
      const element = this.productCarousel.nativeElement;
      const scrollAmount = element.clientWidth * 0.8;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  viewCatalog() {
    this.router.navigate(['/products']);
  }

  viewProducts(category: Category) {
    this.router.navigate(['/products', category.id]);
  }

  viewDetails(product: Product) {
    this.router.navigate(['/products/details', product.id]);
  }

  viewAllProducts() {
    this.router.navigate(['/products']);
  }

  // ===== MÉTODOS AUXILIARES =====
  getCategoryImage(category: Category): string {
    if (!category || !category.name) {
      console.warn('Categoría inválida o sin nombre:', category);
      return '/images/default-category.png';
    }
  
    const image = this.categoryImages[category.name];
    if (!image) {
      console.warn(`No se encontró una imagen para la categoría: ${category.name}`);
      return '/images/default-category.png';
    }
  
    return image;
  }

  isActive(product: Product): boolean {
    return !!product.active && product.active === true;
  }

  // ===== MÉTODOS PARA NAVEGACIÓN DE TABS =====
  selectCategoryTab(categoryName: string, event: Event) {
    // Remover clase active de todos los tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Agregar clase active al tab seleccionado
    (event.target as HTMLElement).classList.add('active');
    
    // Aquí podrías filtrar productos por categoría si quisieras
    console.log('Categoría seleccionada:', categoryName);
  }

  // ===== MÉTODOS PARA ANÁLITICS (OPCIONAL) =====
  trackProductView(product: Product) {
    // Aquí podrías enviar eventos a Google Analytics
    console.log('Producto visto:', product.name);
  }

  trackCategoryClick(category: Category) {
    // Tracking de clicks en categorías
    console.log('Categoría clickeada:', category.name);
  }

  // ===== MÉTODO PARA SCROLL TO TOP =====
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ===== MÉTODO PARA AGREGAR AL CARRITO RÁPIDO =====
  quickAddToCart(product: Product, event: Event) {
    event.stopPropagation(); // Evitar navegación al detalle
    
    // Aquí implementarías la lógica del carrito
    console.log('Agregando al carrito:', product.name);
    
    // Mostrar feedback visual
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