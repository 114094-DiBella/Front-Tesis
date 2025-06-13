// footer.component.ts
import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./footer.component.css'],
  encapsulation: ViewEncapsulation.None // ✅ CLAVE: Esto permite que los estilos sobrescriban Bootstrap
})
export class FooterComponent implements OnDestroy {
  
  email: string = '';
  emailTienda: string = 'info@tienda.com';
  showFAQ: boolean = false;
  instagramUrl: string = 'https://www.instagram.com/dibella.indumentaria/';
  facebookUrl: string = 'https://www.facebook.com/dibella.indumentaria';
  whatsappUrl: string = 'https://wa.me/3516533654'; // Reemplaza con tu número de WhatsApp
  twitterUrl: string = 'https://twitter.com/tu_tienda';
  direccionTienda: string = 'Tomas de Archondo 2877 Yofre Norte, Córdoba, Argentina';
  telefonoTienda: string = '+351 6533654';
  horarioAtencion: string = 'Lunes a Sabados: 9:00 - 13:00 || 17:00 - 21:00';
  currentYear: number = new Date().getFullYear();

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
    },
    {
      id: 7,
      question: "¿Cómo puedo seguir el estado de mi pedido?",
      answer: "Una vez realizada la compra, recibirás un número de orden. Puedes verificar el estado en la sección 'Mis Pedidos' de tu cuenta o contactándonos directamente.",
      isOpen: false
    },
    {
      id: 8,
      question: "¿Qué pasa si un producto llega defectuoso?",
      answer: "Si recibes un producto defectuoso, contáctanos inmediatamente. Te proporcionaremos un cambio o reembolso completo sin costo adicional para ti.",
      isOpen: false
    }
  ];

  // Mostrar el modal de FAQ
  showFAQModal(): void {
    this.showFAQ = true;
    // Cerrar todas las FAQ al abrir el modal
    this.faqItems.forEach(item => item.isOpen = false);
    
    // Evitar scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    // Focus en el modal para accesibilidad
    setTimeout(() => {
      const modal = document.querySelector('.faq-modal-overlay') as HTMLElement;
      if (modal) {
        modal.focus();
      }
    }, 100);
  }

  // Ocultar el modal de FAQ
  hideFAQ(): void {
    this.showFAQ = false;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Toggle FAQ individual
  toggleFAQ(id: number): void {
    this.faqItems = this.faqItems.map(item => ({
      ...item,
      isOpen: item.id === id ? !item.isOpen : item.isOpen
    }));
  }

  // Newsletter con mejor validación
  subscribeNewsletter(): void {
    if (!this.email) {
      this.showAlert('Por favor ingresa tu email', 'warning');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showAlert('Por favor ingresa un email válido', 'error');
      return;
    }

    // Simular suscripción
    console.log('✅ Suscripción al newsletter:', this.email);
    this.showAlert('¡Gracias por suscribirte! Recibirás nuestras novedades pronto.', 'success');
    this.email = '';
  }

  // Función para mostrar alertas
  private showAlert(message: string, type: 'success' | 'error' | 'warning'): void {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    
    alert(`${icons[type]} ${message}`);
  }

  // Validación de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  }

  // Función para manejar tecla Enter en el newsletter
  onNewsletterKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.subscribeNewsletter();
    }
  }

  // Función para manejar tecla ESC
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.showFAQ) {
      this.hideFAQ();
    }
  }

  // Scroll suave a secciones
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Lifecycle hook para limpiar
  ngOnDestroy(): void {
    // Restaurar scroll del body si el componente se destruye con el modal abierto
    document.body.style.overflow = 'auto';
  }
}