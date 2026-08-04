import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../../shared/icon/icon';

interface NavItem {
  icon: IconName;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/' },
    { icon: 'folder', label: 'Produtos', route: '/produtos' },
    { icon: 'chart', label: 'Relatórios', route: '/relatorios' },
    { icon: 'settings', label: 'Configurações', route: '/configuracoes' },
  ];
}
