import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Product, ProductsService } from '../../core/products.service';
import { StockService } from '../../core/stock.service';
import { ChartComponent } from '../../shared/chart/chart';
import { IconComponent, IconName } from '../../shared/icon/icon';
import { SkeletonComponent } from '../../shared/skeleton/skeleton';

interface StatCard {
  label: string;
  value: string;
  icon: IconName;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, IconComponent, SkeletonComponent, ChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly productsService = inject(ProductsService);
  readonly stock = inject(StockService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly skeletonRows = [1, 2, 3, 4];

  readonly stats = computed<StatCard[]>(() => {
    const items = this.products();
    const totalItens = items.reduce((sum, p) => sum + this.stock.quantityFor(p.id), 0);
    const valorTotal = items.reduce((sum, p) => sum + this.stock.quantityFor(p.id) * p.price, 0);
    const baixoEstoque = items.filter((p) => this.stock.quantityFor(p.id) < this.stock.lowStockThreshold).length;

    return [
      { label: 'Produtos cadastrados', value: `${items.length}`, icon: 'folder' },
      { label: 'Itens em estoque', value: totalItens.toLocaleString('pt-BR'), icon: 'dashboard' },
      {
        label: 'Valor total em estoque',
        value: valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        icon: 'chart',
      },
      { label: 'Produtos com estoque baixo', value: `${baixoEstoque}`, icon: 'bell' },
    ];
  });

  readonly categoryLabels = computed(() => Array.from(new Set(this.products().map((p) => p.category))));

  readonly categoryQuantities = computed(() =>
    this.categoryLabels().map((category) =>
      this.products()
        .filter((p) => p.category === category)
        .reduce((sum, p) => sum + this.stock.quantityFor(p.id), 0),
    ),
  );

  readonly categoryValues = computed(() =>
    this.categoryLabels().map((category) =>
      Math.round(
        this.products()
          .filter((p) => p.category === category)
          .reduce((sum, p) => sum + this.stock.quantityFor(p.id) * p.price, 0),
      ),
    ),
  );

  readonly preferredCategoryProducts = computed(() => {
    const preferred = this.auth.currentUser()?.preferredCategory;
    if (!preferred) return [];
    return this.products()
      .filter((p) => p.category === preferred)
      .slice(0, 4);
  });

  readonly recentMovements = computed(() => this.stock.movements().slice(0, 5));

  constructor() {
    this.productsService.getProducts().subscribe((items) => {
      this.products.set(items);
      this.stock.ensureSeeded(items.map((p) => p.id));
      this.loading.set(false);
    });
  }
}
