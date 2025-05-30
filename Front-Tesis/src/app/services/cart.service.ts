// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  subtotal: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'shopping_cart';
  private readonly FREE_SHIPPING_THRESHOLD = 69999; // $69.999 para envío gratis
  private readonly SHIPPING_COST = 9999; // $9.999 de envío

  // BehaviorSubject para mantener el estado del carrito
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartSummarySubject = new BehaviorSubject<CartSummary>(this.getEmptyCartSummary());

  // Observables públicos
  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  // Cargar carrito desde localStorage
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        this.cartItemsSubject.next(cartItems);
        this.updateCartSummary(cartItems);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      this.clearCart();
    }
  }

  // Guardar carrito en localStorage
  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }

  // Agregar producto al carrito
  addToCart(product: Product, quantity: number = 1, size?: string, color?: string): boolean {
    try {
      const currentItems = this.cartItemsSubject.value;
      
      // Verificar si el producto ya existe en el carrito (mismo id, size, color)
      const existingItemIndex = currentItems.findIndex(item => 
        item.product.id === product.id && 
        item.size === (size || product.size) && 
        item.color === (color || product.color)
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Si existe, actualizar cantidad
        updatedItems = [...currentItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Verificar stock disponible
        const availableStock = Number(product.stock) || 0;
        if (newQuantity > availableStock) {
          console.warn('No hay suficiente stock disponible');
          return false;
        }

        updatedItems[existingItemIndex].quantity = newQuantity;
        updatedItems[existingItemIndex].subtotal = newQuantity * (product.price || 0);
      } else {
        // Si no existe, agregar nuevo item
        const availableStock = Number(product.stock) || 0;
        if (quantity > availableStock) {
          console.warn('No hay suficiente stock disponible');
          return false;
        }

        const newItem: CartItem = {
          product: product,
          quantity: quantity,
          size: size || product.size,
          color: color || product.color,
          subtotal: quantity * (product.price || 0)
        };

        updatedItems = [...currentItems, newItem];
      }

      // Actualizar estado y storage
      this.cartItemsSubject.next(updatedItems);
      this.updateCartSummary(updatedItems);
      this.saveCartToStorage(updatedItems);

      return true;
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      return false;
    }
  }

  // Actualizar cantidad de un item
  updateQuantity(productId: string, newQuantity: number, size?: string, color?: string): boolean {
    try {
      const currentItems = this.cartItemsSubject.value;
      const itemIndex = currentItems.findIndex(item => 
        item.product.id === productId && 
        item.size === size && 
        item.color === color
      );

      if (itemIndex === -1) return false;

      const updatedItems = [...currentItems];
      const item = updatedItems[itemIndex];

      // Verificar stock
      const availableStock = Number(item.product.stock) || 0;
      if (newQuantity > availableStock) {
        console.warn('No hay suficiente stock disponible');
        return false;
      }

      if (newQuantity <= 0) {
        // Si la cantidad es 0 o negativa, eliminar el item
        updatedItems.splice(itemIndex, 1);
      } else {
        // Actualizar cantidad y subtotal
        updatedItems[itemIndex].quantity = newQuantity;
        updatedItems[itemIndex].subtotal = newQuantity * (item.product.price || 0);
      }

      this.cartItemsSubject.next(updatedItems);
      this.updateCartSummary(updatedItems);
      this.saveCartToStorage(updatedItems);

      return true;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return false;
    }
  }

  // Eliminar item del carrito
  removeFromCart(productId: string, size?: string, color?: string): boolean {
    try {
      const currentItems = this.cartItemsSubject.value;
      const updatedItems = currentItems.filter(item => 
        !(item.product.id === productId && 
          item.size === size && 
          item.color === color)
      );

      this.cartItemsSubject.next(updatedItems);
      this.updateCartSummary(updatedItems);
      this.saveCartToStorage(updatedItems);

      return true;
    } catch (error) {
      console.error('Error al eliminar item del carrito:', error);
      return false;
    }
  }

  // Limpiar carrito completamente
  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.cartSummarySubject.next(this.getEmptyCartSummary());
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  // Actualizar resumen del carrito
  private updateCartSummary(items: CartItem[]): void {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const discount = 0; // Por ahora sin descuentos, se puede implementar después
    const shipping = subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
    const total = subtotal - discount + shipping;

    const summary: CartSummary = {
      subtotal,
      discount,
      shipping,
      total,
      itemCount
    };

    this.cartSummarySubject.next(summary);
  }

  // Obtener resumen vacío
  private getEmptyCartSummary(): CartSummary {
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      itemCount: 0
    };
  }

  // Obtener items del carrito (valor actual)
  getCurrentCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  // Obtener resumen del carrito (valor actual)
  getCurrentCartSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  // Verificar si un producto está en el carrito
  isInCart(productId: string, size?: string, color?: string): boolean {
    const currentItems = this.cartItemsSubject.value;
    return currentItems.some(item => 
      item.product.id === productId && 
      item.size === size && 
      item.color === color
    );
  }

  // Obtener cantidad de un producto en el carrito
  getProductQuantityInCart(productId: string, size?: string, color?: string): number {
    const currentItems = this.cartItemsSubject.value;
    const item = currentItems.find(item => 
      item.product.id === productId && 
      item.size === size && 
      item.color === color
    );
    return item ? item.quantity : 0;
  }

  // Preparar datos para enviar al backend
  prepareOrderData(userId: string, paymentMethodId: string): any {
    const cartItems = this.getCurrentCartItems();
    
    return {
      detalles: cartItems.map(item => ({
        idProducto: item.product.id,
        cantidad: item.quantity
      })),
      userId: userId,
      idFormaPago: paymentMethodId
    };
  }

  // Calcular cuánto falta para envío gratis
  getAmountForFreeShipping(): number {
    const currentSummary = this.getCurrentCartSummary();
    const remaining = this.FREE_SHIPPING_THRESHOLD - currentSummary.subtotal;
    return Math.max(0, remaining);
  }

  // Obtener porcentaje de progreso para envío gratis
  getFreeShippingProgress(): number {
    const currentSummary = this.getCurrentCartSummary();
    const progress = (currentSummary.subtotal / this.FREE_SHIPPING_THRESHOLD) * 100;
    return Math.min(100, progress);
  }
}