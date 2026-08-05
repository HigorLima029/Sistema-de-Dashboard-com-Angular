import * as XLSX from 'xlsx';

/**
 * Exporta uma lista de objetos simples (linhas já formatadas, com as
 * chaves como cabeçalho) para um arquivo .xlsx e dispara o download
 * no navegador. Reutilizável por qualquer relatório da aplicação.
 */
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, string | number>[]): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // largura de coluna automática, com base no maior conteúdo de cada uma
  const columns = rows.length ? Object.keys(rows[0]) : [];
  worksheet['!cols'] = columns.map((col) => {
    const maxLen = Math.max(col.length, ...rows.map((row) => `${row[col] ?? ''}`.length));
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
