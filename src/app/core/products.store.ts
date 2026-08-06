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
const OVERRIDES_KEY = 'inventory-product-overrides-v1';
const HIDDEN_KEY = 'inventory-hidden-products-v1';

/**
 * Store de produtos (Signals). Busca a API pública uma vez e mantém o
 * resultado em cache compartilhado — Dashboard, Produtos e Relatórios
 * leem o mesmo estado sem refazer a requisição a cada navegação.
 *
 * Produtos cadastrados manualmente (`addProduct`) ficam num signal
 * separado, persistido em `localStorage`, e são somados ao catálogo
 * da API no signal público `products`. Recebem ids negativos para
 * nunca colidir com os ids reais da API.
 *
 * Edições (`updateProduct`) em produtos da API (que não têm um
 * backend próprio pra salvar) ficam guardadas como "overrides" —
 * um mapa de alterações por id, aplicado por cima do produto
 * original ao montar `products`. Produtos cadastrados manualmente
 * são editados diretamente.
 *
 * Exclusão (`deleteProduct`) remove de vez os cadastrados manualmente;
 * produtos da API são apenas ocultados (lista de ids escondidos),
 * já que não existe como apagar de verdade de uma API pública alheia.
 */
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _apiProducts = signal<Product[]>([]);
  private readonly _localProducts = signal<Product[]>(this.restoreLocal());
  private readonly _overrides = signal<Record<number, NewProductInput>>(this.restoreOverrides());
  private readonly _hiddenIds = signal<number[]>(this.restoreHidden());
  private readonly _loading = signal(true);

  readonly products = computed(() => {
    const overrides = this._overrides();
    const hidden = new Set(this._hiddenIds());

    const apiVisiveis = this._apiProducts()
      .filter((p) => !hidden.has(p.id))
      .map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));

    return [...this._localProducts(), ...apiVisiveis];
  });
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

  /** Edita um produto existente — seja ele cadastrado manualmente ou vindo da API. */
  updateProduct(id: number, changes: NewProductInput): void {
    const isLocal = this._localProducts().some((p) => p.id === id);

    if (isLocal) {
      const updated = this._localProducts().map((p) => (p.id === id ? { ...p, ...changes } : p));
      this._localProducts.set(updated);
      this.persistLocal(updated);
      return;
    }

    const overrides = { ...this._overrides(), [id]: changes };
    this._overrides.set(overrides);
    this.persistOverrides(overrides);
  }

  /** Exclui um produto — remove de vez se for cadastro manual, ou oculta se vier da API. */
  deleteProduct(id: number): void {
    const isLocal = this._localProducts().some((p) => p.id === id);

    if (isLocal) {
      const updated = this._localProducts().filter((p) => p.id !== id);
      this._localProducts.set(updated);
      this.persistLocal(updated);
      return;
    }

    const hidden = [...this._hiddenIds(), id];
    this._hiddenIds.set(hidden);
    this.persistHidden(hidden);
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

  private restoreOverrides(): Record<number, NewProductInput> {
    if (!this.isBrowser) return {};
    try {
      const raw = localStorage.getItem(OVERRIDES_KEY);
      return raw ? (JSON.parse(raw) as Record<number, NewProductInput>) : {};
    } catch {
      return {};
    }
  }

  private restoreHidden(): number[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(HIDDEN_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }

  private persistLocal(value: Product[]): void {
    if (this.isBrowser) localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(value));
  }

  private persistOverrides(value: Record<number, NewProductInput>): void {
    if (this.isBrowser) localStorage.setItem(OVERRIDES_KEY, JSON.stringify(value));
  }

  private persistHidden(value: number[]): void {
    if (this.isBrowser) localStorage.setItem(HIDDEN_KEY, JSON.stringify(value));
  }
}
