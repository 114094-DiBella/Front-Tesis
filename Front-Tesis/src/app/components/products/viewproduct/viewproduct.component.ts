import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Category } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.services';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-viewproduct',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './viewproduct.component.html',
  styleUrl: './viewproduct.component.css'
})
export class ViewproductComponent implements OnInit {
  // Arrays para almacenar productos y categorías
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Variables para seguimiento de filtros
  searchTerm: string = '';
  selectedCategory: string = '';
  sortOrder: string = '';
  
  // Estados de la UI
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Variable para el formulario de filtros
  filterForm: FormGroup;

  isAdmin: boolean = true; // Bandera para verificar si el usuario es administrador
  
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }
  
  ngOnInit(): void {
    this.isLoading = true;
    
    // Cargar productos y categorías
    this.loadCategories();
    
    // Suscribirse a los cambios en el formulario de filtros
    this.filterForm.valueChanges.subscribe(filters => {
      this.applyFilters();
    });
  }
  
  createFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      categoryId: [''],
      sortOrder: ['']
    });
  }
  
  // Método para obtener el nombre de la categoría por ID
  getCategoryName(categoryId: string): string {
    console.log('Buscando categoría con ID:', categoryId);
    console.log('Categorías disponibles:', this.categories);
    
    if (!categoryId) return 'Sin categoría';
    
    const category = this.categories.find(c => {
      // Verificar coincidencia examinando también tipos de datos
      console.log(`Comparando ${c.id} (${typeof c.id}) con ${categoryId} (${typeof categoryId})`);
      return c.id?.toString() === categoryId.toString();
    });
    
    return category ? category.name || 'Sin categoría' : 'Sin categoría';
  }
  
  // Método para obtener el texto del orden seleccionado
  getSortOrderText(order: string): string {
    switch (order) {
      case 'price-asc':
        return 'Precio menor a mayor';
      case 'price-desc':
        return 'Precio mayor a menor';
      case 'newest':
        return 'Más recientes';
      default:
        return '';
    }
  }
  
  // Método para cargar categorías
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categorías cargadas:', this.categories);
        
        // Cargar productos después de tener las categorías
        this.getAllProducts();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.errorMessage = 'Error al cargar categorías. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  // Método para cargar todos los productos
  getAllProducts(): void {
    this.isLoading = true;
    this.errorMessage = ''; // Limpiar mensaje de error previo
    
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        try {
          // Procesar las URLs de las imágenes
          this.products = response.map((product: Product) => {
            if (product.imageUrls && product.imageUrls.length > 0) {
              // Si es un array, procesamos cada URL
              if (Array.isArray(product.imageUrls)) {
                product.imageUrls = product.imageUrls.map((url: string) => {
                  // Si la URL comienza con "/images/", agregarle el prefijo del backend
                  if (url && url.startsWith('/images/')) {
                    return 'http://localhost:8080' + url;
                  }
                  return url;
                });
              } else {
                // Si no es un array (podría ser un solo string), convertirlo en array
                const imageUrl = product.imageUrls;
              }
            }
            return product;
          });
          
          console.log('Products processed:', this.products);
          
          // Inicializar productos filtrados con todos los productos
          this.filteredProducts = [...this.products];
          this.isLoading = false;
        } catch (err) {
          console.error('Error processing products:', err);
          this.errorMessage = 'Error al procesar los productos. Por favor, intente de nuevo.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error obtaining products:', error);
        this.errorMessage = 'Error al cargar los productos. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  // Método para aplicar filtros
  applyFilters(): void {
    const filters = this.filterForm.value;
    this.searchTerm = filters.searchTerm ? filters.searchTerm.toLowerCase().trim() : '';
    this.selectedCategory = filters.categoryId || '';
    this.sortOrder = filters.sortOrder || '';
    
    console.log('Aplicando filtros:', {
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategory,
      sortOrder: this.sortOrder
    });
    
    // Comenzar con todos los productos
    let result = [...this.products];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      result = result.filter(product => 
        (product.name?.toLowerCase() || '').includes(this.searchTerm) ||
        (product.marca?.name?.toLowerCase() || '').includes(this.searchTerm) ||
        (product.category?.name?.toLowerCase() || '').includes(this.searchTerm)
      );
    }
    
    // Filtrar por categoría
    if (this.selectedCategory) {
      console.log('Filtrando por categoría:', this.selectedCategory);
      
      result = result.filter(product => {
        const productCategoryId = product.category?.id;
        console.log(`Comparando producto ${product.name} con categoría ${productCategoryId} vs ${this.selectedCategory}`);
        
        // Normalizar comparación para evitar problemas con tipos de datos
        return productCategoryId?.toString() === this.selectedCategory.toString();
      });
      
      console.log('Productos después del filtro de categoría:', result);
    }
    
    // Ordenar productos
    if (this.sortOrder) {
      result.sort((a, b) => {
        switch (this.sortOrder) {
          case 'price-asc':
            return (a.price || 0) - (b.price || 0);
          case 'price-desc':
            return (b.price || 0) - (a.price || 0);
          case 'newest':
            // Si tienes campo de fecha de creación, úsalo aquí
            // Por ahora usamos el id como aproximación
            return (b.id || '').localeCompare(a.id || '');
          default:
            return 0;
        }
      });
    }
    
    // Actualizar productos filtrados
    this.filteredProducts = result;
    console.log('Productos filtrados:', this.filteredProducts.length);
  }
  
  // Método para resetear filtros
  resetFilters(): void {
    this.filterForm.patchValue({
      searchTerm: '',
      categoryId: '',
      sortOrder: ''
    });
    this.filteredProducts = [...this.products];
  }
  
  // Método para buscar al presionar Enter o el botón de búsqueda
  onSearch(): void {
    this.applyFilters();
  }
  
  // Métodos para manejar interacciones con productos
  onEditProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }
  
  onDeleteProduct(product: Product): void {
    if (confirm(`¿Está seguro que desea eliminar el producto "${product.name}"?`)) {
      this.isLoading = true;
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          this.getAllProducts(); // Recargar los productos
        },
        error: (error) => {
          console.error('Error al eliminar el producto:', error);
          this.errorMessage = 'Error al eliminar el producto. Por favor, intente de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }
  
  onViewProduct(product: Product): void {
    this.router.navigate(['/products/view', product.id]);
  }
  
  onAddProduct(): void {
    this.router.navigate(['/products/new']);
  }
}