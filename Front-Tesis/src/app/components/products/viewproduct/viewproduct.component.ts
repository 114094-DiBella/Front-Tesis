import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Category } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.services';
import { Router, ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }
  
  ngOnInit(): void {
    this.isLoading = true;
    
    // Primero cargar las categorías
    this.loadCategories().then(() => {
      // Después, examinar los parámetros de la ruta
      this.route.params.subscribe(params => {
        const categoryId = params['id'];
        console.log('ID de categoría desde URL:', categoryId);
        
        if (categoryId) {
          // Si hay un ID de categoría en la URL, aplicarlo al formulario
          this.selectedCategory = categoryId;
          this.filterForm.patchValue({
            categoryId: categoryId
          });
          console.log('Formulario actualizado con categoría:', this.filterForm.value);
        }
        
        // Finalmente, cargar todos los productos
        this.getAllProducts();
      });
    });
    
    // Suscribirse a los cambios en el formulario de filtros
    this.filterForm.valueChanges.subscribe(filters => {
      console.log('Formulario cambió:', filters);
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
    if (!categoryId) return 'Sin categoría';
    
    const category = this.categories.find(c => c.id?.toString() === categoryId.toString());
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
  loadCategories(): Promise<void> {
    return new Promise((resolve) => {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          console.log('Categorías cargadas:', this.categories);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
          this.errorMessage = 'Error al cargar categorías. Por favor, intente de nuevo.';
          this.isLoading = false;
          resolve(); // Resolver de todos modos para continuar
        }
      });
    });
  }
  
  // Método para cargar todos los productos
  getAllProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products]; // Inicializar productos filtrados
        console.log('Productos cargados:', this.products);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.errorMessage = 'Error al cargar productos. Por favor, intente de nuevo.';
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
    console.log('Total productos antes de filtrar:', result.length);
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      result = result.filter(product => 
        (product.name?.toLowerCase() || '').includes(this.searchTerm) ||
        (product.marca?.name?.toLowerCase() || '').includes(this.searchTerm) ||
        (product.category?.name?.toLowerCase() || '').includes(this.searchTerm)
      );
      console.log('Productos después del filtro de búsqueda:', result.length);
    }
    
    // Filtrar por categoría
    if (this.selectedCategory) {
      console.log('Filtrando por categoría:', this.selectedCategory);
      
      result = result.filter(product => {
        const productCategoryId = product.category?.id;
        console.log(`Producto [${product.name}]: ID Categoría [${productCategoryId}] vs Filtro [${this.selectedCategory}]`);
        
        // Comparar como strings para evitar problemas de tipo
        const match = productCategoryId?.toString() === this.selectedCategory.toString();
        if (match) {
          console.log(`COINCIDENCIA: Producto ${product.name}`);
        }
        return match;
      });
      
      console.log('Productos después del filtro de categoría:', result.length);
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
            return (b.id || '').localeCompare(a.id || '');
          default:
            return 0;
        }
      });
    }
    
    // Actualizar productos filtrados
    this.filteredProducts = result;
    console.log('Productos filtrados finales:', this.filteredProducts.length);
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

  viewDetails(product: Product): void {
    this.router.navigate(['/products/details', product.id]);
  }
}