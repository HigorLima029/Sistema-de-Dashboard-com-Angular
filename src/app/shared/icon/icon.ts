import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type IconName =
  | 'menu'
  | 'sun'
  | 'moon'
  | 'chevron-left'
  | 'chevron-right'
  | 'dashboard'
  | 'users'
  | 'chart'
  | 'settings'
  | 'bell'
  | 'search'
  | 'folder'
  | 'logout';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.html',
})
export class IconComponent {
  @Input() name: IconName = 'dashboard';
  @Input() size = 20;
}
