import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button-component',
  imports: [],
  templateUrl: './whatsapp-button-component.component.html',
  styleUrl: './whatsapp-button-component.component.css'
})
export class WhatsappButtonComponentComponent {
  private readonly phoneNumber = '3516533654'; // Tu número argentino
  private readonly defaultMessage = 'Hola! Me interesa conocer más sobre sus productos.';

  openWhatsApp(): void {
    // URL para WhatsApp Web/App
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.defaultMessage)}`;
    
    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
  }

  // Método alternativo con mensaje personalizado
  openWhatsAppWithMessage(customMessage: string): void {
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(customMessage)}`;
    window.open(whatsappUrl, '_blank');
  }

}
