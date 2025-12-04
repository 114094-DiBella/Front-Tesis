import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent implements OnInit {
  userId!: string;
  userForm!: FormGroup;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
    
    // Obtener el ID del usuario de la URL
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadUserData();
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      numberDoc: ['', Validators.required],
      birthday: ['', Validators.required]
    });
  }

  loadUserData(): void {
    this.isLoading = true;
    console.log("Cargando usuario con ID:", this.userId);
    this.authService.getUserById(this.userId).subscribe({
      next: (user) => {
        // Formatear la fecha para el input date
          
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          telephone: user.telephone,
          numberDoc: user.numberDoc,
          birthday: user.birthday
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.errorMessage = 'No se pudo cargar la información del usuario. Por favor intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.authService.getUserById(this.userId).subscribe({
      next: (currentUser) => {
        const updatedUser = {
          id: this.userId,
          ...this.userForm.value,
          password: currentUser.password,
          birthday: new Date(this.userForm.value.birthday)
        };
        console.log("Este es el usuario a actualizar" , updatedUser)
        this.authService.updateUser(this.userId, updatedUser).subscribe({
          next: () => {
            this.successMessage = 'Usuario actualizado correctamente';
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/users']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error al actualizar usuario:', error);
            this.errorMessage = 'No se pudo actualizar el usuario. Por favor intente de nuevo.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener datos del usuario:', error);
        this.errorMessage = 'No se pudieron obtener los datos actuales del usuario.';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}