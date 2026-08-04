import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ThemeService } from '../../core/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `<canvas #canvasRef></canvas>`,
  styleUrl: './chart.scss',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() type: ChartType = 'bar';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label = '';

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeService = inject(ThemeService);

  private chart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      this.themeService.theme();
      if (this.viewReady && this.isBrowser) this.render();
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.isBrowser) this.render();
  }

  ngOnChanges(): void {
    if (this.viewReady && this.isBrowser) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    this.chart?.destroy();

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--color-accent').trim() || '#0ea5a0';
    const accent2 = styles.getPropertyValue('--color-accent-2').trim() || '#e8a33d';
    const textMuted = styles.getPropertyValue('--color-text-muted').trim() || '#6b7280';
    const border = styles.getPropertyValue('--color-border').trim() || '#e3e6ed';
    const palette = [accent, accent2, '#5b8def', '#8e6ff0', '#e5484d', '#17a672'];
    const isDoughnut = this.type === 'doughnut' || this.type === 'pie';

    const config: ChartConfiguration = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.label,
            data: this.data,
            backgroundColor: isDoughnut ? palette : accent,
            borderColor: this.type === 'line' ? accent : 'transparent',
            borderWidth: isDoughnut ? 0 : this.type === 'line' ? 2 : 0,
            borderRadius: this.type === 'bar' ? 6 : 0,
            tension: 0.35,
            hoverOffset: isDoughnut ? 6 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 450 },
        plugins: {
          legend: {
            display: isDoughnut,
            position: 'bottom',
            labels: { color: textMuted, boxWidth: 10, font: { family: 'Inter', size: 11 } },
          },
          tooltip: { enabled: true },
        },
        scales: isDoughnut
          ? {}
          : {
              x: { ticks: { color: textMuted }, grid: { display: false } },
              y: { ticks: { color: textMuted }, grid: { color: border } },
            },
      },
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
