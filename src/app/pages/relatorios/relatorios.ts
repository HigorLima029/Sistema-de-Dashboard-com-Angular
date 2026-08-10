import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockMovement, StockService } from '../../core/stock.service';
import { cpfValidator } from '../../core/validators';
import { CardComponent } from '../../shared/card/card';
import { IconComponent } from '../../shared/icon/icon';
import { ModalComponent } from '../../shared/modal/modal';
import { TableComponent } from '../../shared/table/table';
import { exportToExcel } from '../../shared/utils/export-excel';

type Periodo = 'hoje' | 'mes' | 'personalizado';
type TipoRelatorio = 'entrada' | 'saida';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    CardComponent,
    TableComponent,
    IconComponent,
    ModalComponent,
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class RelatoriosComponent {
  private readonly stock = inject(StockService);
  private readonly fb = inject(FormBuilder);

  readonly tipo = signal<TipoRelatorio>('saida');
  readonly periodo = signal<Periodo>('mes');
  readonly dataInicio = signal(this.formatDate(this.umMesAtras()));
  readonly dataFim = signal(this.formatDate(new Date()));
  readonly editingMovement = signal<StockMovement | null>(null);

  readonly editDestinoForm = this.fb.nonNullable.group({
    destinatario: ['', Validators.required],
    cpf: ['', [Validators.required, cpfValidator]],
    cliente: ['', Validators.required],
    endereco: ['', Validators.required],
  });

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

  abrirEditarDestino(movement: StockMovement): void {
    this.editDestinoForm.reset({
      destinatario: movement.destino?.recipientName ?? '',
      cpf: movement.destino?.cpf ?? '',
      cliente: movement.destino?.client ?? '',
      endereco: movement.destino?.address ?? '',
    });
    this.editingMovement.set(movement);
  }

  fecharEditarDestino(): void {
    this.editingMovement.set(null);
  }

  confirmarEditarDestino(): void {
    if (this.editDestinoForm.invalid) {
      this.editDestinoForm.markAllAsTouched();
      return;
    }

    const movement = this.editingMovement();
    if (!movement) return;

    const { destinatario, cpf, cliente, endereco } = this.editDestinoForm.getRawValue();

    this.stock.atualizarDestino(movement.id, {
      recipientName: destinatario,
      cpf,
      client: cliente,
      address: endereco,
    });

    this.fecharEditarDestino();
  }

  exportar(): void {
    const dados = this.movimentosFiltrados();
    if (dados.length === 0) return;

    const isEntrada = this.tipo() === 'entrada';

    const rows: Record<string, string | number>[] = isEntrada
      ? dados.map((m) => ({
          Data: new Date(m.date).toLocaleString('pt-BR'),
          Produto: m.productTitle,
          Quantidade: m.quantity,
        }))
      : dados.map((m) => ({
          Data: new Date(m.date).toLocaleString('pt-BR'),
          Produto: m.productTitle,
          Quantidade: m.quantity,
          Cliente: m.destino?.client ?? '',
          Destinatário: m.destino?.recipientName ?? '',
          CPF: m.destino?.cpf ?? '',
          Endereço: m.destino?.address ?? '',
          IMEIs: m.imeis?.join(', ') ?? '',
        }));

    const sufixoPeriodo = this.periodo() === 'hoje' ? 'hoje' : this.periodo() === 'mes' ? 'ultimo-mes' : 'personalizado';
    const nomeArquivo = `relatorio-${isEntrada ? 'entradas' : 'saidas'}-${sufixoPeriodo}`;
    const nomeAba = isEntrada ? 'Entradas' : 'Saídas';

    exportToExcel(nomeArquivo, nomeAba, rows);
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
