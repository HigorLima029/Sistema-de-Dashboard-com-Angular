import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { IconComponent } from '../../shared/icon/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() toggleMobile = new EventEmitter<void>();

  constructor(public readonly theme: ThemeService) {}
}
