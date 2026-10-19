import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, MonthlyRecap } from '../types';
import { formatRupiah, formatDateIndo, INDO_MONTHS } from './formatters';

export function exportMonthlyPdf(recap: MonthlyRecap, businessName: string = 'TIRTA KEUANGAN (Tangki Air)') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthName = INDO_MONTHS[recap.month - 1] || `Bulan ${recap.month}`;
  const periodText = `${monthName} ${recap.year}`;
  const printDate = formatDateIndo(new Date().toISOString().substring(0, 10));

  // --- HEADER BANNER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Accent Cyan Line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 32, 210, 2, 'F');

  // Title: TIRTA KEUANGAN
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TIRTA KEUANGAN', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Laporan Keuangan Bulanan Usaha Penjualan Air Tangki • ${businessName}`, 14, 21);

  // Metadata Right
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Periode: ${periodText}`, 196, 14, { align: 'right' });
  doc.text(`Tanggal Cetak: ${printDate}`, 196, 20, { align: 'right' });

  // --- A. RINGKASAN KEUANGAN ---
  const startY = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('A. Ringkasan Keuangan', 14, startY);

  const boxW = 57;
  const boxH = 20;
  const boxY = startY + 4;

  // Box 1: Pemasukan
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, boxY, boxW, boxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PEMASUKAN', 18, boxY + 6.5);
  doc.setFontSize(11.5);
  doc.text(formatRupiah(recap.totalIncome), 18, boxY + 14.5);

  // Box 2: Pengeluaran
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(76, boxY, boxW, boxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PENGELUARAN', 80, boxY + 6.5);
  doc.setFontSize(11.5);
  doc.text(formatRupiah(recap.totalExpense), 80, boxY + 14.5);

  // Box 3: Saldo Bersih
  const isNetPositive = recap.netBalance >= 0;
  doc.setFillColor(isNetPositive ? 236 : 254, isNetPositive ? 254 : 242, isNetPositive ? 255 : 242);
  doc.setDrawColor(isNetPositive ? 6 : 239, isNetPositive ? 182 : 68, isNetPositive ? 212 : 68);
  doc.roundedRect(138, boxY, boxW, boxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(isNetPositive ? 14 : 153, isNetPositive ? 116 : 27, isNetPositive ? 144 : 27);
  doc.setFont('helvetica', 'bold');
  doc.text('SALDO BERSIH', 142, boxY + 6.5);
  doc.setFontSize(11.5);
  doc.text(formatRupiah(recap.netBalance), 142, boxY + 14.5);

  // --- B. RINCIAN PEMASUKAN ---
  const incomeTransactions = recap.transactions.filter((t) => t.type === 'income');
  const sectionBY = boxY + boxH + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`B. Rincian Pemasukan (${incomeTransactions.length} Transaksi)`, 14, sectionBY);

  const incomeRows = incomeTransactions.map((t, idx) => [
    String(idx + 1),
    formatDateIndo(t.date),
    t.category,
    t.description || '-',
    t.vehiclePlate || '-',
    t.volumeLiters ? `${t.volumeLiters.toLocaleString('id-ID')} L` : '-',
    formatRupiah(t.amount),
  ]);

  autoTable(doc, {
    startY: sectionBY + 3,
    head: [['No', 'Tanggal', 'Kategori', 'Keterangan', 'Plat', 'Liter', 'Nominal']],
    body: incomeRows.length
      ? incomeRows
      : [['-', '-', 'Belum ada pemasukan pada periode ini', '-', '-', '-', 'Rp 0']],
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129], // emerald-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 32 },
      3: { cellWidth: 55 },
      4: { cellWidth: 22 },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 23, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // --- C. RINCIAN PENGELUARAN PER KATEGORI ---
  const docAny = doc as unknown as { lastAutoTable: { finalY: number } };
  let currentY = docAny.lastAutoTable.finalY + 9;

  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('C. Rincian Pengeluaran per Kategori', 14, currentY);

  const expenseCategories = recap.categories.filter((c) => c.type === 'expense');
  const expenseRows = expenseCategories.map((c, idx) => [
    String(idx + 1),
    c.category,
    `${c.count} transaksi`,
    formatRupiah(c.totalAmount),
    `${c.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Kategori Pengeluaran', 'Frekuensi', 'Total Biaya', 'Porsi %']],
    body: expenseRows.length
      ? expenseRows
      : [['-', 'Belum ada pengeluaran pada periode ini', '-', 'Rp 0', '0%']],
    theme: 'striped',
    headStyles: {
      fillColor: [244, 63, 94], // rose-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 65 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 29, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // --- D. RIWAYAT TRANSAKSI SELURUH BULAN ---
  currentY = docAny.lastAutoTable.finalY + 9;
  if (currentY > 235) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`D. Riwayat Seluruh Transaksi (${recap.transactions.length} Baris)`, 14, currentY);

  const allRows = recap.transactions.map((t, idx) => [
    String(idx + 1),
    formatDateIndo(t.date),
    t.type === 'income' ? 'MASUK' : 'KELUAR',
    t.category,
    t.description || '-',
    formatRupiah(t.amount),
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal']],
    body: allRows.length
      ? allRows
      : [['-', '-', '-', 'Belum ada transaksi pada periode ini', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 40 },
      4: { cellWidth: 60 },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `TIRTA KEUANGAN • Laporan Bulanan Tangki Air (${periodText}) • Hal ${data.pageNumber} dari ${pageCount}`,
        14,
        290
      );
    },
  });

  // Download PDF
  const filename = `TIRTA-KEUANGAN-${recap.year}-${String(recap.month).padStart(2, '0')}.pdf`;
  doc.save(filename);
}
