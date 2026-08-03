import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SkeletonComponent } from '../skeleton/skeleton';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [SkeletonComponent],
  templateUrl: './placeholder.html',
  styleUrl: './placeholder.scss',
})
export class PlaceholderComponent {
  readonly loading = signal(true);
  readonly title: string;

  constructor(route: ActivatedRoute) {
    this.title = (route.snapshot.data['title'] as string) ?? 'Página';
    setTimeout(() => this.loading.set(false), 700);
  }
}
