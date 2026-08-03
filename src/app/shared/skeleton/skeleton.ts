import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <span
      class="skeleton"
      [class.skeleton--circle]="variant === 'circle'"
      [style.width]="width"
      [style.height]="height"
      [style.borderRadius]="variant === 'circle' ? '50%' : radius"
    ></span>
  `,
  styleUrl: './skeleton.scss',
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '8px';
  @Input() variant: 'block' | 'circle' = 'block';
}
