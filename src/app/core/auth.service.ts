import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AppUser {
  username: string;
  name: string;
  role: string;
  preferredCategory: string;
}

interface DemoAccount {
  password: string;
  user: AppUser;
}

const STORAGE_KEY = 'auth-user';

/**
 * Contas de demonstração. Como este projeto não tem backend próprio,
 * a autenticação é simulada no cliente — suficiente para demonstrar
 * rotas protegidas e personalização por usuário.
 */
const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  admin: {
    password: 'admin123',
    user: {
      username: 'admin',
      name: 'Admin',
      role: 'Gestor de estoque',
      preferredCategory: 'electronics',
    },
  },
  higor: {
    password: '123456',
    user: {
      username: 'higor',
      name: 'Higor',
      role: 'Operador',
      preferredCategory: "men's clothing",
    },
  },
};

/**
 * Estado de sessão do usuário (Signals). O signal interno é privado —
 * a única forma de alterar a sessão é por `login()`/`logout()`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _currentUser = signal<AppUser | null>(this.restoreSession());
  readonly currentUser = this._currentUser.asReadonly();

  login(username: string, password: string): boolean {
    const account = DEMO_ACCOUNTS[username.trim().toLowerCase()];
    if (!account || account.password !== password) return false;

    this._currentUser.set(account.user);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
    }
    return true;
  }

  logout(): void {
    this._currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private restoreSession(): AppUser | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AppUser;
    } catch {
      return null;
    }
  }
}
