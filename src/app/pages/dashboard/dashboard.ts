import { Component, signal } from '@angular/core';
import { IconComponent, IconName } from '../../shared/icon/icon';
import { SkeletonComponent } from '../../shared/skeleton/skeleton';

interface StatCard {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  icon: IconName;
}

interface ActivityItem {
  title: string;
  time: string;
  icon: IconName;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IconComponent, SkeletonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  readonly loading = signal(true);
  readonly skeletonRows = [1, 2, 3, 4];

  readonly stats: StatCard[] = [
    { label: 'Usuários ativos', value: '4.218', delta: '+12,4%', trend: 'up', icon: 'users' },
    { label: 'Receita mensal', value: 'R$ 82.940', delta: '+6,1%', trend: 'up', icon: 'chart' },
    { label: 'Novos cadastros', value: '318', delta: '-3,2%', trend: 'down', icon: 'folder' },
    { label: 'Chamados abertos', value: '27', delta: '-18,0%', trend: 'down', icon: 'bell' },
  ];

  readonly activities: ActivityItem[] = [
    { title: 'Novo usuário cadastrado: Marina Alves', time: 'há 5 min', icon: 'users' },
    { title: 'Relatório mensal gerado', time: 'há 32 min', icon: 'chart' },
    { title: 'Chamado #482 resolvido', time: 'há 1 h', icon: 'bell' },
    { title: 'Backup automático concluído', time: 'há 3 h', icon: 'folder' },
  ];

  constructor() {
    setTimeout(() => this.loading.set(false), 900);
  }
}
