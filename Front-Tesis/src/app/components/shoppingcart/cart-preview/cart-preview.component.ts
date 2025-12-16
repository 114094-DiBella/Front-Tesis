import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem, CartSummary } from '../../../services/cart.service';

@Component({
  selector: 'app-cart-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-preview.component.html',
  styleUrls: ['./cart-preview.component.css']
})
export class CartPreviewComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private router = inject(Router);

  open = false;
  items: CartItem[] = [];
  summary: CartSummary | null = null;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(this.cartService.previewOpen$.subscribe(v => this.open = v));
    this.subs.push(this.cartService.cartItems$.subscribe(items => this.items = items));
    this.subs.push(this.cartService.cartSummary$.subscribe(s => this.summary = s));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  close(): void {
    this.cartService.closePreview();
  }

  goToCartPage(): void {
    this.close();
    this.router.navigate(['/orders/new']);
  }

  increase(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id as any, item.quantity + 1, item.size, item.color);
  }

  decrease(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id as any, item.quantity - 1, item.size, item.color);
  }

  remove(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id as any, item.size, item.color);
  }
}
