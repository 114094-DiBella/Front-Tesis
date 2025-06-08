// footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  
  email: string = '';
  emailTienda : string = 'info@tienda.com';

  faqItems: FAQItem[] = [
    {
      id: 1,
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer: "Aceptamos efectivo, tarjetas de crédito y débito, transferencias bancarias y MercadoPago. Todos los pagos son seguros y están protegidos.",
      isOpen: false
    },
    {
      id: 2,
      question: "¿Cuál es la política de devoluciones?",
      answer: "Ofrecemos 30 días para cambios y devoluciones. Los productos deben estar en perfecto estado, sin uso y con etiquetas originales. El cliente debe presentar el comprobante de compra.",
      isOpen: false
    },
    {
      id: 3,
      question: "¿Realizan envíos a domicilio?",
      answer: "Actualmente ofrecemos retiro en tienda. Estamos trabajando para implementar envíos a domicilio pronto. Te notificaremos cuando esté disponible.",
      isOpen: false
    },
    {
      id: 4,
      question: "¿Cómo puedo consultar el stock de un producto?",
      answer: "El stock se muestra en tiempo real en cada producto. Si dice 'Sin stock', el producto no está disponible. Puedes contactarnos para consultar reposición.",
      isOpen: false
    },
    {
      id: 5,
      question: "¿Ofrecen descuentos por volumen?",
      answer: "Sí, ofrecemos descuentos especiales para compras mayoristas. Contáctanos directamente para obtener una cotización personalizada.",
      isOpen: false
    },
    {
      id: 6,
      question: "¿Puedo reservar un producto?",
      answer: "Sí, puedes reservar productos agregándolos al carrito. Las reservas se mantienen por 24 horas. Después de ese tiempo, el stock vuelve a estar disponible.",
      isOpen: false
    }
  ];

  toggleFAQ(id: number): void {
    this.faqItems = this.faqItems.map(item => ({
      ...item,
      isOpen: item.id === id ? !item.isOpen : false
    }));
  }

  subscribeNewsletter(): void {
    if (this.email && this.isValidEmail(this.email)) {
      console.log('Suscripción al newsletter:', this.email);
      alert('¡Gracias por suscribirte! Recibirás nuestras novedades pronto.');
      this.email = '';
    } else {
      alert('Por favor ingresa un email válido');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
