import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PlaceholderComponent } from './shared/placeholder/placeholder';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent, title: 'Dashboard' },
      {
        path: 'usuarios',
        component: PlaceholderComponent,
        data: { title: 'Usuários' },
        title: 'Usuários',
      },
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
