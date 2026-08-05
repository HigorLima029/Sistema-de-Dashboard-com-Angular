import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
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

export interface NewProductInput {
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
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
const LOCAL_PRODUCTS_KEY = 'inventory-local-products-v1';

/**
 * Store de produtos (Signals). Busca a API pública uma vez e mantém o
 * resultado em cache compartilhado — Dashboard, Produtos e Relatórios
 * leem o mesmo estado sem refazer a requisição a cada navegação.
 *
 * Produtos cadastrados manualmente (`addProduct`) ficam num signal
 * separado, persistido em `localStorage`, e são somados ao catálogo
 * da API no signal público `products`. Recebem ids negativos para
 * nunca colidir com os ids reais da API.
 */
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _apiProducts = signal<Product[]>([]);
  private readonly _localProducts = signal<Product[]>(this.restoreLocal());
  private readonly _loading = signal(true);

  readonly products = computed(() => [...this._localProducts(), ...this._apiProducts()]);
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
        this._apiProducts.set(
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

  /** Cadastra um novo produto localmente (persistido, id negativo). */
  addProduct(input: NewProductInput): Product {
    const existingIds = this._localProducts().map((p) => p.id);
    const nextId = existingIds.length ? Math.min(...existingIds) - 1 : -1;

    const product: Product = { id: nextId, rating: 0, ...input };
    const updated = [product, ...this._localProducts()];

    this._localProducts.set(updated);
    this.persistLocal(updated);

    return product;
  }

  private restoreLocal(): Product[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      return raw ? (JSON.parse(raw) as Product[]) : [];
    } catch {
      return [];
    }
  }

  private persistLocal(value: Product[]): void {
    if (this.isBrowser) localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(value));
  }
}
