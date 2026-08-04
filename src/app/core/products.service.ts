import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map, of } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Busca produtos reais da API pública. Só executa no navegador. */
  getProducts(): Observable<Product[]> {
    if (!this.isBrowser) return of([]);

    return this.http.get<RawProduct[]>(API_URL).pipe(
      map((items) =>
        items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          category: item.category,
          image: item.image,
          description: item.description,
          rating: item.rating?.rate ?? 0,
        })),
      ),
    );
  }
}
