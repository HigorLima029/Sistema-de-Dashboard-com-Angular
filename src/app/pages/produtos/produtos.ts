import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, ProductsService } from '../../core/products.service';
import { StockService } from '../../core/stock.service';
import { IconComponent } from '../../shared/icon/icon';
import { SkeletonComponent } from '../../shared/skeleton/skeleton';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IconComponent, SkeletonComponent],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class ProdutosComponent {
  private readonly productsService = inject(ProductsService);
  readonly stock = inject(StockService);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly search = signal('');
  readonly selectedCategory = signal<string>('todas');
  readonly skeletonRows = [1, 2, 3, 4, 5];

  readonly stepById = signal<Record<number, number>>({});

  readonly categories = computed(() => {
    const set = new Set(this.products().map((p) => p.category));
    return ['todas', ...Array.from(set)];
  });

  readonly filteredProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter((p) => {
      const matchesCategory = category === 'todas' || p.category === category;
      const matchesSearch = !term || p.title.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  constructor() {
    this.productsService.getProducts().subscribe((items) => {
      this.products.set(items);
      this.stock.ensureSeeded(items.map((p) => p.id));
      this.loading.set(false);
    });
  }

  stepFor(productId: number): number {
    return this.stepById()[productId] ?? 1;
  }

  setStep(productId: number, value: string): void {
    const parsed = Math.max(1, Number(value) || 1);
    this.stepById.update((current) => ({ ...current, [productId]: parsed }));
  }

  registrar(product: Product, type: 'entrada' | 'saida'): void {
    const quantidade = this.stepFor(product.id);
    this.stock.registrarMovimento(product.id, product.title, type, quantidade);
  }

  isLowStock(productId: number): boolean {
    return this.stock.quantityFor(productId) < this.stock.lowStockThreshold;
  }
}
