import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../models/product.model';
import { CategoryService } from '../../services/category.services';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  // Arrays para datos
  categories: Category[] = [];
  
  // Formulario
  categoryForm: FormGroup;
  
  // Estados de la UI
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Para edición
  editingCategory: Category | null = null;
  isEditing: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  // Crear formulario
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      image_url: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]]
    });
  }

  // Cargar todas las categorías
  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categorías cargadas:', this.categories);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.errorMessage = 'Error al cargar las categorías. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // Enviar formulario
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const categoryData = this.categoryForm.value;

    if (this.isEditing && this.editingCategory?.id) {
      // Actualizar categoría existente
      this.categoryService.updateCategory(this.editingCategory.id, categoryData).subscribe({
        next: () => {
          this.successMessage = 'Categoría actualizada exitosamente';
          this.resetForm();
          this.loadCategories();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.errorMessage = 'Error al actualizar la categoría. Por favor, intente de nuevo.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Crear nueva categoría
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.successMessage = 'Categoría creada exitosamente';
          this.resetForm();
          this.loadCategories();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.errorMessage = 'Error al crear la categoría. Por favor, intente de nuevo.';
          this.isSubmitting = false;
        }
      });
    }
  }

  // Editar categoría
  editCategory(category: Category): void {
    this.editingCategory = category;
    this.isEditing = true;
    this.categoryForm.patchValue({
      name: category.name,
      image_url: category.image_url || ''
    });
    this.clearMessages();
  }

  // Eliminar categoría
  deleteCategory(category: Category): void {
    if (!category.id) return;

    const confirmDelete = confirm(`¿Está seguro que desea eliminar la categoría "${category.name}"?`);
    if (!confirmDelete) return;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.successMessage = 'Categoría eliminada exitosamente';
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        this.errorMessage = 'Error al eliminar la categoría. Puede que esté siendo utilizada por productos.';
      }
    });
  }

  // Cancelar edición
  cancelEdit(): void {
    this.resetForm();
  }

  // Resetear formulario
  resetForm(): void {
    this.categoryForm.reset();
    this.isEditing = false;
    this.editingCategory = null;
    this.clearMessages();
  }

  // Limpiar mensajes
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Marcar campos como touched para mostrar errores
  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  // Verificar si un campo tiene error
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.categoryForm.get(fieldName);
    if (errorType) {
      return !!(field?.hasError(errorType) && field?.touched);
    }
    return !!(field?.invalid && field?.touched);
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minlength')) {
      return 'Debe tener al menos 2 caracteres';
    }
    if (field?.hasError('maxlength')) {
      return 'No puede tener más de 50 caracteres';
    }
    if (field?.hasError('pattern')) {
      return 'Debe ser una URL válida de imagen (jpg, jpeg, png, gif, webp)';
    }
    return '';
  }

  // Verificar si la imagen es válida
  isValidImageUrl(url: string): boolean {
    if (!url) return false;
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  // Vista previa de imagen
  previewImage(url: string): void {
    if (this.isValidImageUrl(url)) {
      window.open(url, '_blank');
    }
  }
}