import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon';

/**
 * Card genérico e reutilizável.
 *
 * Modo "stat": passe `icon`, `title` (label) e `value` — renderiza um
 * cartão compacto de métrica.
 *
 * Modo "painel": passe apenas `title`/`icon` (opcionais) e use o
 * conteúdo projetado (`<ng-content>`) para qualquer coisa — gráfico,
 * lista, tabela etc.
 *
 * Passe `clickable` para deixar o card interativo (cursor, hover,
 * acessível via teclado) e escute `(cardClick)`.
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class CardComponent {
  @Input() title?: string;
  @Input() icon?: IconName;
  @Input() value?: string;
  @Input() clickable = false;
  @Output() cardClick = new EventEmitter<void>();

  onActivate(): void {
    if (this.clickable) this.cardClick.emit();
  }
}
