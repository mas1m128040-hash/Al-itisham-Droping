import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  ExternalLink,
  TableProperties,
} from 'lucide-react';
import { Transaction, Category, User, MonthlyRecap, BusinessProfile } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  INDO_MONTHS,
  formatNumber,
} from '../utils/formatters';
import { exportMonthlyPdf } from '../utils/exportPdf';
import { exportMonthlyCsv } from '../utils/exportCsv';
import { AppApiService } from '../services/api';

interface ReportsPageProps {
  transactions: Transaction[];
  categories: Category[];
  currentUser: User | null;
  businessProfile?: BusinessProfile;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  transactions,
  categories,
  businessProfile,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Compute monthly recap data
  const recap = useMemo<MonthlyRecap>(() => {
    const monthStr = String(selectedMonth).padStart(2, '0');
    const prefix = `${selectedYear}-${monthStr}`;

    const monthTransactions = transactions
      .filter((t) => t.date.startsWith(prefix))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalIncome = 0;
    let totalExpense = 0;

    const catMap = new Map<string, { totalAmount: number; count: number; type: 'income' | 'expense' }>();

    monthTransactions.forEach((t) => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;

      if (!catMap.has(t.category)) {
        catMap.set(t.category, { totalAmount: 0, count: 0, type: t.type });
      }
      const c = catMap.get(t.category)!;
      c.totalAmount += t.amount;
      c.count += 1;
    });

    const categoryBreakdown = Array.from(catMap.entries()).map(([catName, data]) => {
      const catMeta = categories.find((c) => c.name === catName);
      const denominator = data.type === 'income' ? totalIncome : totalExpense;
      const percentage = denominator > 0 ? (data.totalAmount / denominator) * 100 : 0;
      return {
        category: catName,
        type: data.type,
        totalAmount: data.totalAmount,
        percentage,
        count: data.count,
        color: catMeta?.color || (data.type === 'income' ? '#0284c7' : '#f97316'),
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      month: selectedMonth,
      year: selectedYear,
      monthName: INDO_MONTHS[selectedMonth - 1] || `Bulan ${selectedMonth}`,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categories: categoryBreakdown,
      transactions: monthTransactions,
    };
  }, [transactions, categories, selectedMonth, selectedYear]);

  // Income transactions list
  const incomeList = useMemo(() => {
    return recap.transactions.filter((t) => t.type === 'income');
  }, [recap.transactions]);

  // Expense grouped by category
  const expenseByCategory = useMemo(() => {
    return recap.categories.filter((c) => c.type === 'expense');
  }, [recap.categories]);

  // Handle PDF Export
  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const companyName = businessProfile?.businessName || businessProfile?.appName || 'TIRTA KEUANGAN (Tangki Air)';
      exportMonthlyPdf(recap, companyName);
    } catch (err) {
      alert('Gagal membuat PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle CSV Export
  const handleDownloadCsv = () => {
    setIsExportingCsv(true);
    try {
      const companyName = businessProfile?.businessName || businessProfile?.appName || 'TIRTA KEUANGAN';
      exportMonthlyCsv(recap, companyName);
    } catch (err) {
      alert('Gagal membuat CSV: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Handle Open Spreadsheet
  const handleOpenSpreadsheet = () => {
    const gasUrl = AppApiService.getAppsScriptUrl();
    if (gasUrl) {
      // In web apps, opening spreadsheet or gas URL
      window.open(gasUrl, '_blank');
    } else {
      window.open('https://docs.google.com/spreadsheets', '_blank');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16 md:pb-8">
      {/* Header & Month/Year Selector */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
              Laporan Keuangan Bulanan
            </h2>
            <p className="text-xs text-slate-500">
              Periode {recap.monthName} {recap.year}
            </p>
          </div>

          {/* Simple Month & Year Select */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              >
                {INDO_MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* E. Action Buttons: Unduh PDF, Ekspor CSV, Buka Google Spreadsheet */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || recap.transactions.length === 0}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={isExportingCsv || recap.transactions.length === 0}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isExportingCsv ? 'Menyiapkan...' : 'Ekspor CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSpreadsheet}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition active:scale-95"
          >
            <TableProperties className="w-3.5 h-3.5 text-cyan-400" />
            <span>Buka Google Spreadsheet</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* A. Ringkasan Keuangan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-emerald-800">
              Total Pemasukan
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-700">
            {formatRupiah(recap.totalIncome)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-rose-200/80 bg-gradient-to-br from-rose-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-rose-800">
              Total Pengeluaran
            </span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-sm sm:text-base font-black text-rose-700">
            {formatRupiah(recap.totalExpense)}
          </div>
        </div>

        <div
          className={`col-span-2 sm:col-span-1 rounded-xl p-2.5 sm:p-3 border shadow-2xs ${
            recap.netBalance >= 0
              ? 'border-cyan-200/80 bg-gradient-to-br from-cyan-50/70 to-white'
              : 'border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-white'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-700">
              Saldo Bersih
            </span>
            <Wallet className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div
            className={`text-sm sm:text-base font-black ${
              recap.netBalance >= 0 ? 'text-cyan-900' : 'text-amber-700'
            }`}
          >
            {formatRupiah(recap.netBalance)}
          </div>
        </div>
      </div>

      {/* B. Rincian Pemasukan */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>B. Rincian Pemasukan ({incomeList.length} Transaksi)</span>
          </h3>
          <span className="text-xs font-extrabold text-emerald-700">
            {formatRupiah(recap.totalIncome)}
          </span>
        </div>

        {incomeList.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">
            Tidak ada pemasukan tercatat pada periode ini.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomeList.map((t) => (
              <div key={t.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-slate-800">{t.category}</span>
                    {t.vehiclePlate && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">
                        {t.vehiclePlate}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {formatDateIndo(t.date)}
                    {t.description ? ` • ${t.description}` : ''}
                  </div>
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-emerald-600 shrink-0">
                  +{formatRupiah(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* C. Rincian Pengeluaran per Kategori */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>C. Rincian Pengeluaran per Kategori</span>
          </h3>
          <span className="text-xs font-extrabold text-rose-700">
            {formatRupiah(recap.totalExpense)}
          </span>
        </div>

        {expenseByCategory.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">
            Tidak ada pengeluaran tercatat pada periode ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {expenseByCategory.map((c, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {c.count} transaksi • {c.percentage.toFixed(1)}%
                  </span>
                </div>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                  {formatRupiah(c.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* D. Riwayat Seluruh Transaksi */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            D. Riwayat Seluruh Transaksi ({recap.transactions.length} Baris)
          </h3>
          <span className="text-[11px] text-slate-400">
            Kronologis urut tanggal
          </span>
        </div>

        {recap.transactions.length === 0 ? (
          <p className="py-5 text-center text-xs text-slate-400">
            Belum ada transaksi pada periode {recap.monthName} {recap.year}.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recap.transactions.map((t, idx) => {
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-mono text-slate-400 w-4">
                        {idx + 1}.
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                          isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isIncome ? 'Masuk' : 'Keluar'}
                      </span>
                      <span className="font-bold text-slate-800 truncate">
                        {t.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 pl-5">
                      {formatDateIndo(t.date)}
                      {t.description ? ` • ${t.description}` : ''}
                    </div>
                  </div>

                  <div
                    className={`font-extrabold text-xs sm:text-sm shrink-0 whitespace-nowrap ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
