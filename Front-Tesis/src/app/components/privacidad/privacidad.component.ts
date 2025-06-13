import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidad',
  imports: [CommonModule, FormsModule],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {

  termsAccepted: boolean = false;
   mailTienda: string = '';
   telefonoTienda: string = '';
   horarioTienda: string = '';
   isLoading: boolean = true;
   emailAAIP: string = '';
   telefonoAAIP: string = '';
   emailProteccionDatos: string = '';

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Términos y Condiciones - Mi Tienda Online');
  }

  // Método para imprimir la página
  printPage(): void {
    window.print();
  }

  // Método para volver atrás
  goBack(): void {
    window.close();
  }

  // Método para cerrar ventana (si se abrió en popup)
  closeWindow(): void {
    if (window.opener) {
      window.close();
    } else {
      this.goBack();
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onTermsChange(event: any): void {
    this.termsAccepted = event.target.checked;
  }

  continuar(): void {
  if (this.termsAccepted) {
    console.log('Términos aceptados');
    
    // Comunicar al componente padre (register) que los términos fueron aceptados
    if (window.opener) {
      // Si se abrió como popup desde el registro
      window.opener.postMessage({ 
        type: 'TERMS_ACCEPTED', 
        accepted: true 
      }, window.location.origin);
      window.close();
    } else {
      // Si se navega directamente
      window.location.href = '/store';
    }
  } else {
    console.warn('Debe aceptar los términos y condiciones para continuar');
  }
}
  isPopup(): boolean {
  // Verifica si la ventana actual es un popup
  return window.opener !== null && !window.opener.closed;

    } 
}
