import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, ProductsStore } from '../../core/products.store';
import { StockService } from '../../core/stock.service';
import { IconComponent } from '../../shared/icon/icon';
import { ModalComponent } from '../../shared/modal/modal';
import { SkeletonComponent } from '../../shared/skeleton/skeleton';
import { TableComponent } from '../../shared/table/table';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IconComponent, TableComponent, ModalComponent, SkeletonComponent],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class ProdutosComponent {
  private readonly productsStore = inject(ProductsStore);
  readonly stock = inject(StockService);

  readonly loading = this.productsStore.loading;
  readonly products = this.productsStore.products;
  readonly search = signal('');
  readonly selectedCategory = signal<string>('todas');
  readonly selectedProduct = signal<Product | null>(null);

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
    // sempre que a store de produtos atualizar, garante quantidade inicial no estoque
    effect(() => {
      const items = this.products();
      if (items.length > 0) {
        this.stock.ensureSeeded(items.map((p) => p.id));
      }
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

  abrirDetalhes(product: Product): void {
    this.selectedProduct.set(product);
  }

  fecharDetalhes(): void {
    this.selectedProduct.set(null);
  }
}
