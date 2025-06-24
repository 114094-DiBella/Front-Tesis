import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacidad',
  imports: [CommonModule, FormsModule],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {

  // Variables de configuración de la empresa
  nombreEmpresa: string = 'BELLATECH';
  sitioWeb: string = 'http://localhost:4200';
  version: string = '1.0';
  tipoProyecto: string = 'Proyecto de Tesis';
  institucionEducativa: string = 'Universidad Tecnológica Nacional - Facultad Regional Córdoba';
  
  // Variables de contacto
  emailSoporte: string = '114094@tecnicatura.frc.utn.edu.ar';
  telefonoTienda: string = '+54 351 6533-654';
  horarioTienda: string = 'Lunes a Sabados de 9:00 a 20:00 hs';
  
  // Variables legales
  legislacionAplicable: string = 'Ley 25.326 de Protección de Datos Personales (Argentina)';
  aniosConservacionFiscal: number = 10;
  
  // Variables de autoridad de control
  autoridadControl: string = 'Agencia de Acceso a la Información Pública (AAIP)';
  sitioWebAAIP: string = 'www.argentina.gob.ar/aaip';
  emailAAIP: string = 'datospersonales@aaip.gob.ar';
  telefonoAAIP: string = '0800-222-DATO (3286)';
  
  // Variables de estado
  isLoading: boolean = true;

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Política de Privacidad - Mi Tienda Online');
    this.isLoading = false;
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}