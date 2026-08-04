import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

/**
 * Tabela genérica. O cabeçalho vem de `columns` + `gridTemplate` (CSS grid).
 * As linhas são projetadas via <ng-template #rowTemplate let-item>,
 * e o skeleton de cada linha via <ng-template #skeletonRowTemplate>.
 *
 * Exemplo de uso:
 * ```html
 * <app-table [columns]="['Nome','Preço']" gridTemplate="2fr 1fr" [items]="produtos" [loading]="loading()">
 *   <ng-template #rowTemplate let-item>
 *     <span>{{ item.nome }}</span>
 *     <span>{{ item.preco }}</span>
 *   </ng-template>
 *   <ng-template #skeletonRowTemplate>
 *     <app-skeleton width="70%"></app-skeleton>
 *     <app-skeleton width="40%"></app-skeleton>
 *   </ng-template>
 * </app-table>
 * ```
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class TableComponent<T> {
  @Input() columns: string[] = [];
  @Input() gridTemplate = '1fr';
  @Input() items: T[] = [];
  @Input() loading = false;
  @Input() skeletonRowCount = 5;
  @Input() emptyMessage = 'Nenhum item encontrado.';

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<{ $implicit: T }>;
  @ContentChild('skeletonRowTemplate') skeletonRowTemplate?: TemplateRef<void>;

  get skeletonRows(): number[] {
    return Array.from({ length: this.skeletonRowCount }, (_, i) => i);
  }
}
