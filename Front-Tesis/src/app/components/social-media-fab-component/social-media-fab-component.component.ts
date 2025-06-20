import { Component } from '@angular/core';

@Component({
  selector: 'app-social-media-fab-component',
  imports: [],
  templateUrl: './social-media-fab-component.component.html',
  styleUrl: './social-media-fab-component.component.css'
})
export class SocialMediaFabComponent {
  isExpanded = false;

  // URLs de redes sociales de la empresa
  private readonly whatsappNumber = '3516533654';
  private readonly facebookUrl = 'https://www.facebook.com/dibella.indumentaria'; // Cambia por tu URL
  private readonly instagramUrl = 'https://www.instagram.com/dibella.indumentaria'; // Cambia por tu URL

  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  openWhatsApp(): void {
    const message = 'Hola! Me interesa conocer más sobre sus productos.';
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    this.isExpanded = false; // Cerrar después de usar
  }

  openFacebook(): void {
    window.open(this.facebookUrl, '_blank');
    this.isExpanded = false;
  }

  openInstagram(): void {
    window.open(this.instagramUrl, '_blank');
    this.isExpanded = false;
  }

  // Método para cerrar cuando se hace click fuera (opcional)
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.social-fab-container')) {
      this.isExpanded = false;
    }
  }
}