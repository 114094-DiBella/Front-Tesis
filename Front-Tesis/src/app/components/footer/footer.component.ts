// footer.component.ts
import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private toastr: ToastrService) {}

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
// REEMPLAZAR DESDE subscribeNewsletter(): void { HASTA el final del método
    subscribeNewsletter(): void {
      if (!this.email) {
        this.toastr.warning('Por favor ingresa tu email', 'Campo requerido');
        return;
      }

      if (!this.isValidEmail(this.email)) {
        this.toastr.error('Por favor ingresa un email válido', 'Email inválido');
        return;
      }

      console.log('✅ Suscripción al newsletter:', this.email);
      this.toastr.success('¡Gracias por suscribirte! Recibirás nuestras novedades pronto.', '¡Éxito!');
      this.email = '';
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

  showPrivacyPolicy(): void {
    window.open('/privacidad', '_blank', 'width=800,height=600');
  }

  // Reemplaza los métodos existentes por estos:

showDevolutionPolicy(): void {
  this.faqItems = [
    {
      id: 1,
      question: "¿Cuánto tiempo tengo para devolver un producto?",
      answer: "Tienes 30 días desde la fecha de compra para realizar cambios o devoluciones.",
      isOpen: false
    },
    {
      id: 2,
      question: "¿En qué estado debe estar el producto para devolverlo?",
      answer: "El producto debe estar en perfecto estado, sin uso y con todas las etiquetas originales.",
      isOpen: false
    },
    {
      id: 3,
      question: "¿Necesito el comprobante de compra?",
      answer: "Sí, es obligatorio presentar el comprobante de compra o boleta para procesar la devolución.",
      isOpen: false
    },
    {
      id: 4,
      question: "¿Hay productos que no se pueden devolver?",
      answer: "No se pueden devolver productos de uso íntimo, productos personalizados o productos en oferta especial.",
      isOpen: false
    }
  ];
  this.showFAQModal();
}

showSizeGuide(): void {
  this.faqItems = [
    {
      id: 1,
      question: "¿Cómo debo tomar mis medidas?",
      answer: "Usa una cinta métrica flexible. Mide contorno de pecho, cintura y cadera en ropa interior ajustada.",
      isOpen: false
    },
    {
      id: 2,
      question: "¿Qué talle debo elegir si estoy entre dos medidas?",
      answer: "Recomendamos elegir el talle mayor para mayor comodidad, especialmente en prendas ajustadas.",
      isOpen: false
    },
    {
      id: 3,
      question: "¿Las medidas son las mismas para todas las marcas?",
      answer: "No, cada marca puede tener ligeras variaciones. Siempre consulta la tabla específica de cada producto.",
      isOpen: false
    },
    {
      id: 4,
      question: "¿Puedo cambiar si el talle no me queda bien?",
      answer: "Sí, puedes cambiar por otro talle dentro de los 30 días, siempre que el producto esté sin uso.",
      isOpen: false
    }
  ];
  this.showFAQModal();
}

showPaymentMethods(): void {
  this.faqItems = [
    {
      id: 1,
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos efectivo, tarjetas de crédito y débito (Visa, Mastercard), transferencias bancarias y MercadoPago.",
      isOpen: false
    },
    {
      id: 2,
      question: "¿Puedo pagar en cuotas?",
      answer: "Sí, con tarjetas de crédito puedes pagar hasta en 6 cuotas sin interés, o más cuotas con interés según tu banco.",
      isOpen: false
    },
    {
      id: 3,
      question: "¿Es seguro pagar con tarjeta?",
      answer: "Absolutamente. Usamos sistemas de encriptación seguros y no almacenamos datos de tarjetas.",
      isOpen: false
    },
    {
      id: 4,
      question: "¿Puedo pagar contraentrega?",
      answer: "Actualmente solo aceptamos pago al momento del retiro en tienda, no ofrecemos contraentrega.",
      isOpen: false
    }
  ];
  this.showFAQModal();
}

showContactInfo(): void {
  this.faqItems = [
    {
      id: 1,
      question: "¿Cuál es la dirección de la tienda?",
      answer: "Nos encontramos en Tomas de Archondo 2877 Yofre Norte, Córdoba, Argentina.",
      isOpen: false
    },
    {
      id: 2,
      question: "¿Cuáles son los horarios de atención?",
      answer: "Atendemos de Lunes a Sábados: 9:00 - 13:00 y 17:00 - 21:00. Domingos cerrado.",
      isOpen: false
    },
    {
      id: 3,
      question: "¿Cómo puedo contactarlos por WhatsApp?",
      answer: "Nuestro WhatsApp es +351 6533654. Respondemos consultas en horario comercial.",
      isOpen: false
    },
    {
      id: 4,
      question: "¿Tienen email de contacto?",
      answer: "Sí, puedes escribirnos a info@tienda.com para consultas generales o reclamos.",
      isOpen: false
    }
  ];
  this.showFAQModal();
}

showTermsAndConditions(): void {
  this.faqItems = [
    {
      id: 1,
      question: "¿Qué acepto al comprar en la tienda?",
      answer: "Al comprar aceptas nuestros precios, política de devoluciones, términos de garantía y uso responsable de nuestros servicios.",
      isOpen: false
    },
    {
      id: 2,
      question: "¿Los precios pueden cambiar?",
      answer: "Sí, los precios están sujetos a cambios sin previo aviso. El precio válido es el mostrado al momento de la compra.",
      isOpen: false
    },
    {
      id: 3,
      question: "¿Qué pasa si hay un problema con mi compra?",
      answer: "Contactanos inmediatamente. Evaluaremos cada caso y buscaremos la mejor solución según nuestros términos.",
      isOpen: false
    },
    {
      id: 4,
      question: "¿Cómo manejan mis datos personales?",
      answer: "Protegemos tu información personal y solo la usamos para procesar compras y comunicaciones relacionadas.",
      isOpen: false
    }
  ];
  this.showFAQModal();
}
}