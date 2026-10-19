import { Transaction, MonthlyRecap } from '../types';

export function exportMonthlyCsv(
  recap: MonthlyRecap,
  businessName: string = 'TIRTA KEUANGAN',
  appName: string = 'TIRTA KEUANGAN'
): void {
  const headers = [
    'ID Transaksi',
    'Tanggal',
    'Jenis Transaksi',
    'Kategori',
    'Nominal (Rp)',
    'Armada Plat Nomor',
    'Volume (Liter)',
    'Keterangan / Rincian',
    'Dibuat Oleh',
    'Waktu Catat',
  ];

  const rows = recap.transactions.map((t: Transaction) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.vehiclePlate || '-').replace(/"/g, '""')}"`,
    t.volumeLiters || 0,
    `"${(t.description || '-').replace(/"/g, '""')}"`,
    `"${t.createdBy}"`,
    `"${t.createdAt}"`,
  ]);

  // Summary lines at top
  const summaryLines = [
    `"LAPORAN KEUANGAN ${(appName || 'TIRTA KEUANGAN').replace(/"/g, '""').toUpperCase()} - ${businessName.replace(/"/g, '""')}"`,
    `"Periode:","${recap.monthName} ${recap.year}"`,
    `"Total Pemasukan:",${recap.totalIncome}`,
    `"Total Pengeluaran:",${recap.totalExpense}`,
    `"Saldo Bersih:",${recap.netBalance}`,
    `"Total Transaksi:",${recap.transactions.length}`,
    '',
    headers.join(','),
  ];

  const csvContent = '\uFEFF' + summaryLines.concat(rows.map((r) => r.join(','))).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Laporan-Keuangan-Tangki-Air-${recap.year}-${String(recap.month).padStart(2, '0')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
