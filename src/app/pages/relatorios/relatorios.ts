import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockMovement, StockService } from '../../core/stock.service';
import { CardComponent } from '../../shared/card/card';
import { TableComponent } from '../../shared/table/table';

type Periodo = 'hoje' | 'mes' | 'personalizado';
type TipoRelatorio = 'entrada' | 'saida';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, CardComponent, TableComponent],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class RelatoriosComponent {
  private readonly stock = inject(StockService);

  readonly tipo = signal<TipoRelatorio>('saida');
  readonly periodo = signal<Periodo>('mes');
  readonly dataInicio = signal(this.formatDate(this.umMesAtras()));
  readonly dataFim = signal(this.formatDate(new Date()));

  readonly movimentosFiltrados = computed<StockMovement[]>(() => {
    const { inicio, fim } = this.intervaloAtivo();
    return this.stock
      .movements()
      .filter((m) => m.type === this.tipo())
      .filter((m) => {
        const data = new Date(m.date).getTime();
        return data >= inicio.getTime() && data <= fim.getTime();
      });
  });

  readonly totalQuantidade = computed(() =>
    this.movimentosFiltrados().reduce((sum, m) => sum + m.quantity, 0),
  );

  readonly totalMovimentos = computed(() => this.movimentosFiltrados().length);

  setTipo(tipo: TipoRelatorio): void {
    this.tipo.set(tipo);
  }

  setPeriodo(periodo: Periodo): void {
    this.periodo.set(periodo);
  }

  private intervaloAtivo(): { inicio: Date; fim: Date } {
    const hoje = new Date();
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);
    const periodo = this.periodo();

    if (periodo === 'hoje') {
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
      return { inicio: inicioHoje, fim: fimHoje };
    }

    if (periodo === 'mes') {
      return { inicio: this.umMesAtras(), fim: fimHoje };
    }

    const inicio = this.dataInicio() ? new Date(`${this.dataInicio()}T00:00:00`) : new Date(0);
    const fim = this.dataFim() ? new Date(`${this.dataFim()}T23:59:59.999`) : fimHoje;
    return { inicio, fim };
  }

  private umMesAtras(): Date {
    const data = new Date();
    data.setMonth(data.getMonth() - 1);
    data.setHours(0, 0, 0, 0);
    return data;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
