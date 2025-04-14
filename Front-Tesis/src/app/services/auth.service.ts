import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

const URL_LOGIN = "http://localhost:8007/login";
const URL_USERS = "http://localhost:8007/users";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
      return this.http.get<User[]>(URL_USERS + "/getall");
    }

    login(user: User): Observable<any> {
      console.log("Login user: ", user);
      const credentials = {
        email: user.email,
        password: user.password
      };
      const respone = this.http.post<any>(URL_LOGIN, credentials);
      console.log("Login response: ", respone); 
      return respone;
    }

    createUser(user: User): Observable<User> {
      console.log("User to create: ", user);
      return this.http.post<User>(URL_USERS + "/create", user);
    }

    
}