import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type MovementType = 'entrada' | 'saida';

export interface StockMovement {
  id: string;
  productId: number;
  productTitle: string;
  type: MovementType;
  quantity: number;
  date: string;
}

const STOCK_KEY = 'inventory-stock-v1';
const MOVEMENTS_KEY = 'inventory-movements-v1';
const LOW_STOCK_THRESHOLD = 15;
const MAX_MOVEMENTS_STORED = 30;

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly stock = signal<Record<number, number>>(this.restoreStock());
  readonly movements = signal<StockMovement[]>(this.restoreMovements());

  readonly lowStockThreshold = LOW_STOCK_THRESHOLD;

  quantityFor(productId: number): number {
    return this.stock()[productId] ?? this.seedQuantity(productId);
  }

  /** Garante que todo produto carregado da API tenha uma quantidade inicial. */
  ensureSeeded(productIds: number[]): void {
    const current = { ...this.stock() };
    let changed = false;

    for (const id of productIds) {
      if (current[id] === undefined) {
        current[id] = this.seedQuantity(id);
        changed = true;
      }
    }

    if (changed) {
      this.stock.set(current);
      this.persistStock(current);
    }
  }

  registrarMovimento(productId: number, productTitle: string, type: MovementType, quantity: number): void {
    if (quantity <= 0) return;

    const current = { ...this.stock() };
    const atual = current[productId] ?? this.seedQuantity(productId);
    const proxima = type === 'entrada' ? atual + quantity : Math.max(0, atual - quantity);

    current[productId] = proxima;
    this.stock.set(current);
    this.persistStock(current);

    const movimento: StockMovement = {
      id: `${Date.now()}-${productId}`,
      productId,
      productTitle,
      type,
      quantity,
      date: new Date().toISOString(),
    };

    const historico = [movimento, ...this.movements()].slice(0, MAX_MOVEMENTS_STORED);
    this.movements.set(historico);
    this.persistMovements(historico);
  }

  private seedQuantity(productId: number): number {
    return 10 + ((productId * 37) % 70);
  }

  private restoreStock(): Record<number, number> {
    if (!this.isBrowser) return {};
    try {
      const raw = localStorage.getItem(STOCK_KEY);
      return raw ? (JSON.parse(raw) as Record<number, number>) : {};
    } catch {
      return {};
    }
  }

  private restoreMovements(): StockMovement[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(MOVEMENTS_KEY);
      return raw ? (JSON.parse(raw) as StockMovement[]) : [];
    } catch {
      return [];
    }
  }

  private persistStock(value: Record<number, number>): void {
    if (this.isBrowser) localStorage.setItem(STOCK_KEY, JSON.stringify(value));
  }

  private persistMovements(value: StockMovement[]): void {
    if (this.isBrowser) localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(value));
  }
}
