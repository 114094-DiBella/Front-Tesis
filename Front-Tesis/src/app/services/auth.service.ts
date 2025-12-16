import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.URL_USERS;
    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
      return this.http.get<User[]>(this.apiUrl + "/users/getall");
    }

    login(user: User): Observable<any> {
      console.log("Login user: ", user);
      const credentials = {
        email: user.email,
        password: user.password
      };
      const respone = this.http.post<any>(this.apiUrl + "/login", credentials);
      console.log("Login response: ", respone); 
      return respone;
    }

    createUser(user: User): Observable<User> {
      console.log("User to create: ", user);
      user.imageUrl = user.imageUrl || 'https://example.com/default-image.png';
      return this.http.post<User>(this.apiUrl + "/users/create", user);
    }

    updateUser(id: string, user: User): Observable<User> {
      console.log("Edit to user:", id, user);
      // Enviar el ID y el usuario en el cuerpo
      return this.http.put<User>(`${this.apiUrl}/users/update/${id}`, user);

  }
    deleteUser(id: string): Observable<void> {
      console.log("usuario por borrar: ", id)
      return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
    }
    
    getUserById(id: string): Observable<User> {
      console.log("userss", id)
      return this.http.get<User>(`${this.apiUrl}/users/${id}`)
    }

    // Obtener el ID del usuario actualmente autenticado (desde localStorage)
    getCurrentUserId(): string | null {
      return localStorage.getItem('userId');
    }

    forgotPassword(email: string): Observable<any> {
      console.log("Email para recuperar contraseña: ", email);
      const payload = { email: email.trim().toLowerCase() };
      return this.http.post<any>(`${this.apiUrl}/users/changePassword`, payload);
    }

    // ✅ NUEVO - Método para restablecer contraseña con token
    resetPassword(token: string, newPassword: string): Observable<any> {
      console.log("Restableciendo contraseña con token");
      const payload = { 
        token: token,
        newPassword: newPassword 
      };
      return this.http.post<any>(`${this.apiUrl}/users/reset-password`, payload);
    }

    // ✅ NUEVO - Método para validar token de recuperación
    validateResetToken(token: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/users/validate-reset-token/${token}`);
    }
}