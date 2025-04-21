import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response;
        this.filteredUsers = response;
        this.isLoading = false;
        console.log('Usuarios obtenidos:', this.users);
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.errorMessage = 'No se pudieron cargar los usuarios. Por favor intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }
    
    const search = this.searchTerm.toLowerCase();
    // this.filteredUsers = this.users.filter(user => 
    //   //user.firstName.toLowerCase().includes(search) || 
    //  // user.lastName.toLowerCase().includes(search) ||
    //  // user.email.toLowerCase().includes(search)
    // );
  }

  onEditUser(user: User): void {
    // Navegar a una ruta de edición o abrir un modal
    console.log('Editar usuario:', user);
    // Ejemplo de navegación a una ruta de edición
    this.router.navigate(['users/edit', user.id]);
  }

  onDeleteUser(user: User): void {
    console.log("Metodo de borrado", user)
    if (!user.id) {
      console.error('No se puede eliminar un usuario sin ID');
      return;
    }
  
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.authService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
          console.log('Usuario eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          alert('No se pudo eliminar el usuario. Por favor intente de nuevo.');
        }
      });
    }
  }
}