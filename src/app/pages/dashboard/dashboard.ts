import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ProductsStore } from '../../core/products.store';
import { StockService } from '../../core/stock.service';
import { CardComponent } from '../../shared/card/card';
import { ChartComponent } from '../../shared/chart/chart';
import { IconComponent, IconName } from '../../shared/icon/icon';
import { SkeletonComponent } from '../../shared/skeleton/skeleton';

interface StatCard {
  label: string;
  value: string;
  icon: IconName;
  /** Query params pra navegar até /produtos já filtrado. Ausente = card não clicável. */
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, IconComponent, SkeletonComponent, ChartComponent, CardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly productsStore = inject(ProductsStore);
  private readonly router = inject(Router);
  readonly stock = inject(StockService);
  readonly auth = inject(AuthService);

  readonly loading = this.productsStore.loading;
  readonly products = this.productsStore.products;
  readonly skeletonRows = [1, 2, 3, 4];

  readonly stats = computed<StatCard[]>(() => {
    const items = this.products();
    const totalItens = items.reduce((sum, p) => sum + this.stock.quantityFor(p.id), 0);
    const valorTotal = items.reduce((sum, p) => sum + this.stock.quantityFor(p.id) * p.price, 0);
    const baixoEstoque = items.filter((p) => this.stock.quantityFor(p.id) < this.stock.lowStockThreshold).length;
    const semFiltro: Record<string, string> = {};

    return [
      { label: 'Produtos cadastrados', value: `${items.length}`, icon: 'folder', queryParams: semFiltro },
      {
        label: 'Itens em estoque',
        value: totalItens.toLocaleString('pt-BR'),
        icon: 'dashboard',
        queryParams: semFiltro,
      },
      {
        label: 'Valor total em estoque',
        value: valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        icon: 'chart',
        // sem queryParams: propositalmente não clicável
      },
      {
        label: 'Produtos com estoque baixo',
        value: `${baixoEstoque}`,
        icon: 'bell',
        queryParams: { estoque: 'baixo' },
      },
    ];
  });

  irParaProdutos(stat: StatCard): void {
    if (!stat.queryParams) return;
    this.router.navigate(['/produtos'], { queryParams: stat.queryParams });
  }

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
    // sempre que a store de produtos atualizar, garante quantidade inicial no estoque
    effect(() => {
      const items = this.products();
      if (items.length > 0) {
        this.stock.ensureSeeded(items.map((p) => p.id));
      }
    });
  }
}
