import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { StoreComponent } from './store/store.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showNavbar: boolean = true;
  showFooter: boolean = true;
  
  // Lista de rutas donde no queremos mostrar navbar/footer
  private authRoutes: string[] = ['/login', '/register', '/forgot-password'];
  
  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Verificar si la ruta actual está en la lista de rutas de autenticación
      const currentRoute = event.urlAfterRedirects;
      this.showNavbar = !this.authRoutes.some(route => currentRoute.startsWith(route));
      this.showFooter = !this.authRoutes.some(route => currentRoute.startsWith(route));
    });
  }
  title = 'Front-Tesis';
}
