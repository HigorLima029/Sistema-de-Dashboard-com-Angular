import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

/**
 * Estado de tema da aplicação (Signals).
 * O signal interno é privado — a única forma de alterar o tema
 * de fora é pelos métodos `toggle()`/`setTheme()`, nunca escrevendo
 * direto no signal exposto.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _theme = signal<ThemeMode>(this.getInitialTheme());
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const mode = this._theme();
      if (!this.isBrowser) return;
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem(STORAGE_KEY, mode);
    });
  }

  toggle(): void {
    this._theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(mode: ThemeMode): void {
    this._theme.set(mode);
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) return 'light';

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
