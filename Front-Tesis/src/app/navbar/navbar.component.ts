import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  user : any = null; // Aquí puedes almacenar la información del usuario autenticado
  isAdmin: boolean = true; // Bandera para verificar si el usuario es administrador
  isLoggedIn: boolean = false; // Bandera para verificar si el usuario está autenticado
  isUser: boolean = false; // Bandera para verificar si el usuario es un cliente normal
  isStore: boolean = false; // Bandera para verificar si el usuario es un vendedor

  constructor() { }

  // Método para cerrar sesión
  logout() {
    // Aquí puedes implementar la lógica para cerrar sesión
    console.log('Cerrando sesión...');
    // Redirigir a la página de inicio de sesión o a otra página
  }


}
