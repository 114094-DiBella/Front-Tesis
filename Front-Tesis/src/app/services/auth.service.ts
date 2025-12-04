import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
      return this.http.get<User[]>(URL_USERS + "/users/getall");
    }

    login(user: User): Observable<any> {
      console.log("Login user: ", user);
      const credentials = {
        email: user.email,
        password: user.password
      };
      const respone = this.http.post<any>(URL_USERS + "/login", credentials);
      console.log("Login response: ", respone); 
      return respone;
    }

    createUser(user: User): Observable<User> {
      console.log("User to create: ", user);
      return this.http.post<User>(URL_USERS + "/users/create", user);
    }

    updateUser(id: string, user: User): Observable<User> {
      console.log("Edit to user:", id, user);
      // Enviar el ID y el usuario en el cuerpo
      return this.http.put<User>(`${URL_USERS}/users/update/${id}`, user);

  }
    deleteUser(id: string): Observable<void> {
      console.log("usuario por borrar: ", id)
      return this.http.delete<void>(`${URL_USERS}/users/${id}`);
    }
    
    getUserById(id: string): Observable<User> {
      console.log("userss", id)
      return this.http.get<User>(`${URL_USERS}/users/${id}`)
    }

    forgotPassword(email: string): Observable<any> {
      console.log("Email para recuperar contraseña: ", email);
      const payload = { email: email.trim().toLowerCase() };
      return this.http.post<any>(`${URL_USERS}/users/changePassword`, payload);
    }

    // ✅ NUEVO - Método para restablecer contraseña con token
    resetPassword(token: string, newPassword: string): Observable<any> {
      console.log("Restableciendo contraseña con token");
      const payload = { 
        token: token,
        newPassword: newPassword 
      };
      return this.http.post<any>(`${URL_USERS}/users/reset-password`, payload);
    }

    // ✅ NUEVO - Método para validar token de recuperación
    validateResetToken(token: string): Observable<any> {
      return this.http.get<any>(`${URL_USERS}/users/validate-reset-token/${token}`);
    }
}