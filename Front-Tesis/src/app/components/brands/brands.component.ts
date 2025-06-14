import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Marca } from '../../models/product.model';
import { MarcaService } from '../../services/marcas.services';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent implements OnInit {
  // Arrays para datos
  marcas: Marca[] = [];
  
  // Formulario
  marcaForm: FormGroup;
  
  // Estados de la UI
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Para edición
  editingMarca: Marca | null = null;
  isEditing: boolean = false;

  constructor(
    private marcaService: MarcaService,
    private fb: FormBuilder
  ) {
    this.marcaForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadMarcas();
  }

  // Crear formulario
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  // Cargar todas las marcas
  loadMarcas(): void {
    this.isLoading = true;
    this.marcaService.getAllMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        console.log('Marcas cargadas:', this.marcas);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.errorMessage = 'Error al cargar las marcas. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  // Enviar formulario
  onSubmit(): void {
    if (this.marcaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const marcaData = this.marcaForm.value;

    if (this.isEditing && this.editingMarca?.id) {
      // Actualizar marca existente
      this.marcaService.updateMarca(this.editingMarca.id, marcaData).subscribe({
        next: () => {
          this.successMessage = 'Marca actualizada exitosamente';
          this.resetForm();
          this.loadMarcas();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error al actualizar marca:', error);
          this.errorMessage = 'Error al actualizar la marca. Por favor, intente de nuevo.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Crear nueva marca
      this.marcaService.createMarca(marcaData).subscribe({
        next: () => {
          this.successMessage = 'Marca creada exitosamente';
          this.resetForm();
          this.loadMarcas();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error al crear marca:', error);
          this.errorMessage = 'Error al crear la marca. Por favor, intente de nuevo.';
          this.isSubmitting = false;
        }
      });
    }
  }

  // Editar marca
  editMarca(marca: Marca): void {
    this.editingMarca = marca;
    this.isEditing = true;
    this.marcaForm.patchValue({
      name: marca.name
    });
    this.clearMessages();
  }

  // Eliminar marca
  deleteMarca(marca: Marca): void {
    if (!marca.id) return;

    const confirmDelete = confirm(`¿Está seguro que desea eliminar la marca "${marca.name}"?`);
    if (!confirmDelete) return;

    this.marcaService.deleteMarca(marca.id).subscribe({
      next: () => {
        this.successMessage = 'Marca eliminada exitosamente';
        this.loadMarcas();
      },
      error: (error) => {
        console.error('Error al eliminar marca:', error);
        this.errorMessage = 'Error al eliminar la marca. Puede que esté siendo utilizada por productos.';
      }
    });
  }

  // Cancelar edición
  cancelEdit(): void {
    this.resetForm();
  }

  // Resetear formulario
  resetForm(): void {
    this.marcaForm.reset();
    this.isEditing = false;
    this.editingMarca = null;
    this.clearMessages();
  }

  // Limpiar mensajes
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Marcar campos como touched para mostrar errores
  private markFormGroupTouched(): void {
    Object.keys(this.marcaForm.controls).forEach(key => {
      const control = this.marcaForm.get(key);
      control?.markAsTouched();
    });
  }

  // Verificar si un campo tiene error
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.marcaForm.get(fieldName);
    if (errorType) {
      return !!(field?.hasError(errorType) && field?.touched);
    }
    return !!(field?.invalid && field?.touched);
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.marcaForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minlength')) {
      return 'Debe tener al menos 2 caracteres';
    }
    if (field?.hasError('maxlength')) {
      return 'No puede tener más de 50 caracteres';
    }
    return '';
  }
}