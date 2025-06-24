import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-terms',
  imports: [CommonModule, FormsModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent implements OnInit, OnDestroy {
  termsAccepted: boolean = false;
  mailTienda: string = '114094@tecnicatura.frc.utn.edu.ar';
  telefonoTienda: string = '+54 351 6533-654';
  horarioTienda: string = 'Lunes a Sabados 9:00 - 20:00hs';
  isLoading: boolean = false;
  
  // Para controlar si es un popup o navegación normal
  isPopup: boolean = false;
  
  // Para manejar el scroll y verificar que el usuario leyó los términos
  hasScrolledToBottom: boolean = false;
  scrollCheckEnabled: boolean = false; // Deshabilitado por defecto

  constructor(
    private titleService: Title,
    private router: Router,
    private location: Location
  ) {
    // Detectar si se abrió como popup
    this.isPopup = window.opener !== null;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Términos y Condiciones - Mi Tienda Online');
    
    // Configurar listener para scroll si queremos verificar que leyó los términos
    if (this.scrollCheckEnabled) {
      this.setupScrollListener();
    }
    
    // Listener para mensajes desde el popup
    if (this.isPopup) {
      window.addEventListener('beforeunload', this.handlePopupClose.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.isPopup) {
      window.removeEventListener('beforeunload', this.handlePopupClose.bind(this));
    }
  }

  // Configurar listener para detectar scroll hasta el final
  private setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Verificar si llegó cerca del final (con un margen de 100px)
      if (scrollTop + windowHeight >= documentHeight - 100) {
        this.hasScrolledToBottom = true;
      }
    });
  }

  // Método para imprimir la página
  printPage(): void {
    window.print();
  }

  // Método para volver atrás mejorado
  goBack(): void {
    if (this.isPopup) {
      this.closeWindow();
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      // Si no hay historial, ir a la página principal
      this.router.navigate(['/']);
    }
  }

  // Método para cerrar ventana (si se abrió en popup)
  closeWindow(): void {
    if (this.isPopup) {
      // Notificar al padre que se cerró sin aceptar
      window.opener?.postMessage({ 
        type: 'TERMS_CLOSED', 
        accepted: false 
      }, window.location.origin);
      window.close();
    } else {
      this.goBack();
    }
  }

  // Manejar cierre del popup
  private handlePopupClose(): void {
    if (this.isPopup && !this.termsAccepted) {
      // Notificar al padre que se cerró sin aceptar
      window.opener?.postMessage({ 
        type: 'TERMS_CLOSED', 
        accepted: false 
      }, window.location.origin);
    }
  }

  // Obtener fecha actual formateada
  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener versión actual de los términos
  getCurrentVersion(): string {
    return '1.0';
  }

  // Manejar cambio en checkbox de términos
  onTermsChange(event: any): void {
    this.termsAccepted = event.target.checked;
  }

  // Verificar si puede continuar (términos aceptados y opcionalmente scroll)
  canContinue(): boolean {
    if (this.scrollCheckEnabled) {
      return this.termsAccepted && this.hasScrolledToBottom;
    }
    return this.termsAccepted;
  }

  // Obtener mensaje de ayuda para el usuario
  getHelpMessage(): string {
    if (!this.termsAccepted && !this.hasScrolledToBottom && this.scrollCheckEnabled) {
      return 'Debes leer completamente los términos y condiciones y marcar la casilla de aceptación.';
    } else if (!this.termsAccepted) {
      return 'Debes marcar la casilla para aceptar los términos y condiciones.';
    } else if (!this.hasScrolledToBottom && this.scrollCheckEnabled) {
      return 'Debes leer completamente los términos y condiciones.';
    }
    return '';
  }

  // Método principal para continuar
  continuar(): void {
    if (!this.canContinue()) {
      // Mostrar mensaje de error o alerta
      const message = this.getHelpMessage();
      if (message) {
        alert(message);
      }
      return;
    }

    this.isLoading = true;

    try {
      // Guardar aceptación en localStorage para referencia futura
      const acceptanceData = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: this.getCurrentVersion(),
        userAgent: navigator.userAgent
      };
      
      localStorage.setItem('termsAcceptance', JSON.stringify(acceptanceData));

      console.log('Términos aceptados:', acceptanceData);
      
      if (this.isPopup) {
        // Si se abrió como popup desde el registro
        window.opener?.postMessage({ 
          type: 'TERMS_ACCEPTED', 
          accepted: true,
          timestamp: acceptanceData.timestamp,
          version: acceptanceData.version
        }, window.location.origin);
        
        // Cerrar popup después de un breve delay
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        // Si se navega directamente, redirigir a la tienda
        setTimeout(() => {
          this.router.navigate(['/store']);
        }, 1000);
      }
    } catch (error) {
      console.error('Error al procesar aceptación de términos:', error);
      alert('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    } finally {
      this.isLoading = false;
    }
  }

  // Verificar si los términos fueron previamente aceptados
  checkPreviousAcceptance(): boolean {
    try {
      const stored = localStorage.getItem('termsAcceptance');
      if (stored) {
        const acceptance = JSON.parse(stored);
        return acceptance.accepted && acceptance.version === this.getCurrentVersion();
      }
    } catch (error) {
      console.error('Error al verificar aceptación previa:', error);
    }
    return false;
  }
}