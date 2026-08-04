import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { ProdutosComponent } from './pages/produtos/produtos';
import { PlaceholderComponent } from './shared/placeholder/placeholder';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Entrar' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, title: 'Dashboard' },
      { path: 'produtos', component: ProdutosComponent, title: 'Produtos' },
      {
        path: 'relatorios',
        component: PlaceholderComponent,
        data: { title: 'Relatórios' },
        title: 'Relatórios',
      },
      {
        path: 'configuracoes',
        component: PlaceholderComponent,
        data: { title: 'Configurações' },
        title: 'Configurações',
      },
    ],
  },
];
