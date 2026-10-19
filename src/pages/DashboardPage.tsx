import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  Calendar,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, ActivePage, User } from '../types';
import { ChartsSection } from '../components/ChartsSection';
import {
  formatRupiah,
  formatDateShort,
  getTodayDateString,
  getFirstDayOfMonth,
} from '../utils/formatters';

interface DashboardPageProps {
  transactions: Transaction[];
  currentUser: User | null;
  onNavigate: (page: ActivePage) => void;
  onOpenAddModal: () => void;
  isSheetsConnected: boolean;
  isSyncing?: boolean;
  onSyncNow?: () => void;
  syncError?: string | null;
}

type SimpleFilter = 'today' | 'month' | 'custom';

export const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  currentUser,
  onNavigate,
  onOpenAddModal,
  isSheetsConnected,
  isSyncing = false,
  onSyncNow,
  syncError,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [filterMode, setFilterMode] = useState<SimpleFilter>('month');

  // Custom period states
  const [customStart, setCustomStart] = useState<string>(getFirstDayOfMonth());
  const [customEnd, setCustomEnd] = useState<string>(getTodayDateString());
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Filtered transactions based on simple period
  const filteredTransactions = useMemo(() => {
    const today = getTodayDateString();
    const firstDayMonth = getFirstDayOfMonth();

    return transactions.filter((t) => {
      if (filterMode === 'today') {
        return t.date === today;
      }
      if (filterMode === 'month') {
        return t.date >= firstDayMonth && t.date.substring(0, 7) === today.substring(0, 7);
      }
      if (filterMode === 'custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
        return true;
      }
      return true;
    });
  }, [transactions, filterMode, customStart, customEnd]);

  // Financial summary
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Recent transactions (maximum 5 transactions)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto pb-16 md:pb-8">
      {/* Indikator Sinkronisasi: Memuat / Gagal Sinkronisasi / Terhubung */}
      {isSyncing && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs font-medium animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
            <span>Memuat data transaksi dan pengaturan terbaru dari Google Spreadsheet...</span>
          </div>
        </div>
      )}

      {syncError && !isSyncing && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Gagal Sinkronisasi: </span>
              <span className="text-slate-700">{syncError}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onSyncNow && (
              <button
                type="button"
                onClick={onSyncNow}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-lg transition"
            >
              Pengaturan
            </button>
          </div>
        </div>
      )}

      {isSheetsConnected && !isSyncing && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Google Spreadsheet Terhubung (Sumber data utama)</span>
          </div>
          {onSyncNow && (
            <button
              type="button"
              onClick={onSyncNow}
              className="text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Perbarui Data</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Filter Periode Sederhana: Hari Ini, Bulan Ini, Pilih Periode */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between gap-1.5">
          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto flex-1">
            <button
              type="button"
              onClick={() => {
                setFilterMode('today');
                setShowCustomPicker(false);
              }}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition text-center ${
                filterMode === 'today'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              Hari Ini
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterMode('month');
                setShowCustomPicker(false);
              }}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition text-center ${
                filterMode === 'month'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              Bulan Ini
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterMode('custom');
                setShowCustomPicker((prev) => !prev);
              }}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 ${
                filterMode === 'custom'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span>Periode</span>
            </button>
          </div>

          {/* Connection Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
            <span
              className={`w-2 h-2 rounded-full ${
                isSheetsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isSheetsConnected ? 'Spreadsheet Terhubung' : 'Offline / Tersimpan Lokal'}</span>
          </div>

          {/* Quick Add Button on Desktop */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-2xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          )}
        </div>

        {/* Expandable Custom Date Picker */}
        {filterMode === 'custom' && showCustomPicker && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs animate-in fade-in">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Dari
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Sampai
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Tiga Kartu Ringkasan yang Ringkas */}
      {/* 2 kolom di HP (Pemasukan, Pengeluaran) & Saldo Bersih selebar layar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Kartu Pemasukan */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Pemasukan
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm sm:text-lg font-black text-emerald-700 truncate">
            {formatRupiah(summary.income)}
          </div>
        </div>

        {/* Kartu Pengeluaran */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-rose-200/80 bg-gradient-to-br from-rose-50/60 to-white shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm sm:text-lg font-black text-rose-700 truncate">
            {formatRupiah(summary.expense)}
          </div>
        </div>

        {/* Kartu Saldo Bersih (col-span-2 pada HP agar jelas terbaca, 1 col pada tablet/desktop) */}
        <div
          className={`col-span-2 sm:col-span-1 rounded-xl p-2.5 sm:p-3.5 border shadow-2xs ${
            summary.net >= 0
              ? 'border-cyan-200/80 bg-gradient-to-br from-cyan-50/70 to-white'
              : 'border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Saldo Bersih
            </span>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                summary.net >= 0
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Wallet className="w-3 h-3" />
            </div>
          </div>
          <div
            className={`text-base sm:text-lg font-black truncate ${
              summary.net >= 0 ? 'text-cyan-900' : 'text-amber-700'
            }`}
          >
            {formatRupiah(summary.net)}
          </div>
        </div>
      </div>

      {/* 4. Grafik Ringkas Pemasukan & Pengeluaran */}
      <ChartsSection transactions={filteredTransactions} />

      {/* 5. Daftar Transaksi Terbaru (Maksimal 5 Transaksi) */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <span className="font-bold text-xs sm:text-sm text-slate-800">
            Transaksi Terbaru
          </span>
          <button
            type="button"
            onClick={() => onNavigate('transactions')}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-5 text-center text-slate-400 text-xs">
            Belum ada transaksi tercatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div
                  key={t.id}
                  className="py-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-bold text-slate-800 truncate">
                        {t.category}
                      </span>
                      {t.vehiclePlate && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                          {t.vehiclePlate}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {formatDateShort(t.date)}
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

      {/* 6. Tombol Tambah Transaksi yang Mudah Dijangkau (Untuk HP & Mobile) */}
      {isAdmin && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-md shadow-cyan-600/25 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi Baru</span>
          </button>
        </div>
      )}
    </div>
  );
};
