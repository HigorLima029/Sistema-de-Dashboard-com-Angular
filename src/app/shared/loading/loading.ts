import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading" [class.loading--inline]="inline" [class.loading--fullscreen]="fullscreen">
      <span
        class="loading__spinner"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.borderTopColor]="color || null"
        [style.borderColor]="color ? color + '40' : null"
      ></span>
      @if (label) {
        <span class="loading__label" [style.color]="color || null">{{ label }}</span>
      }
    </div>
  `,
  styleUrl: './loading.scss',
})
export class LoadingComponent {
  @Input() label?: string;
  @Input() size = 18;
  /** Sobrescreve a cor do spinner/label — útil dentro de botões com fundo colorido. */
  @Input() color?: string;
  /** Alinha o spinner na mesma linha do texto (ex: dentro de um botão). */
  @Input() inline = false;
  /** Centraliza o loading ocupando toda a altura disponível do container pai. */
  @Input() fullscreen = false;
}
