import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
