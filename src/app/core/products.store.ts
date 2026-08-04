import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
}

interface RawProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: { rate: number; count: number };
}

const API_URL = 'https://fakestoreapi.com/products';

/**
 * Store de produtos (Signals). Busca a API pública UMA vez e mantém
 * o resultado em cache compartilhado — como é `providedIn: 'root'`,
 * Dashboard, Produtos e qualquer outra tela leem o mesmo estado sem
 * refazer a requisição a cada navegação. Chame `refresh()` para
 * forçar uma nova busca.
 */
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(true);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    if (!this.isBrowser) {
      this._loading.set(false);
      return;
    }

    this._loading.set(true);
    this.http.get<RawProduct[]>(API_URL).subscribe({
      next: (items) => {
        this._products.set(
          items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            category: item.category,
            image: item.image,
            description: item.description,
            rating: item.rating?.rate ?? 0,
          })),
        );
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }
}
