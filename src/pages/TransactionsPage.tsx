import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Droplet,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, Category, User } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  formatNumber,
} from '../utils/formatters';

interface TransactionsPageProps {
  transactions: Transaction[];
  categories: Category[];
  currentUser: User | null;
  onOpenAddModal: () => void;
  onOpenEditModal: (trx: Transaction) => void;
  onRequestDelete: (trx: Transaction) => void;
  isSheetsConnected: boolean;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  categories,
  currentUser,
  onOpenAddModal,
  onOpenEditModal,
  onRequestDelete,
  isSheetsConnected,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterCategory('all');
    setStartDate('');
    setEndDate('');
  };

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Search text (description, category, plate, id)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.vehiclePlate?.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Type filter
      if (filterType !== 'all' && t.type !== filterType) return false;

      // Category filter
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;

      // Date range filter
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      return true;
    });
  }, [transactions, search, filterType, filterCategory, startDate, endDate]);

  // Filtered totals
  const totals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filtered.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { inc, exp, net: inc - exp };
  }, [filtered]);

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto pb-16 md:pb-8">
      {/* Top Header Card */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
            Data Transaksi Tangki Air
          </h2>
          <p className="text-xs text-slate-500">
            Riwayat arus kas penjualan air dan pengeluaran armada
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/25 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70">
            Mode Viewer (Lihat Saja)
          </div>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari keterangan, kategori, plat nomor (B 9182 TGA), atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {/* Tipe Transaksi */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Jenis
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="income">Pemasukan Saja</option>
              <option value="expense">Pengeluaran Saja</option>
            </select>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Tanggal Sampai */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3 font-medium">
            <span className="text-slate-500">
              Menampilkan <strong>{filtered.length}</strong> dari {transactions.length} transaksi
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
              Masuk: {formatRupiah(totals.inc)}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
              Keluar: {formatRupiah(totals.exp)}
            </span>
            <span className="text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md font-bold">
              Net: {formatRupiah(totals.net)}
            </span>
          </div>

          {(search || filterType !== 'all' || filterCategory !== 'all' || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">Tidak ada transaksi ditemukan</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada transaksi yang cocok dengan kriteria pencarian dan filter Anda.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (< 768px) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5"
                >
                  {/* Top: Category & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {t.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {formatDateIndo(t.date)} &bull; {t.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-extrabold block ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle & Volume Tag */}
                  {(t.vehiclePlate || t.volumeLiters) && (
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {t.vehiclePlate && (
                        <span className="font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                          <Truck className="w-3 h-3 text-slate-500" />
                          {t.vehiclePlate}
                        </span>
                      )}
                      {t.volumeLiters && t.volumeLiters > 0 && (
                        <span className="font-semibold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded flex items-center gap-1 border border-cyan-200">
                          <Droplet className="w-3 h-3 text-cyan-600" />
                          {formatNumber(t.volumeLiters)} Liter
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {t.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {t.description}
                    </p>
                  )}

                  {/* Actions for Admin */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenEditModal(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onRequestDelete(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-3">Tipe</th>
                    <th className="py-3.5 px-3">Kategori</th>
                    <th className="py-3.5 px-3">Armada / Liter</th>
                    <th className="py-3.5 px-4">Keterangan</th>
                    <th className="py-3.5 px-4 text-right">Nominal</th>
                    {isAdmin && <th className="py-3.5 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((t) => {
                    const isIncome = t.type === 'income';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {formatDateIndo(t.date)}
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">
                            {t.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isIncome ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {t.category}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            {t.vehiclePlate && (
                              <span className="font-mono text-slate-700 font-medium">
                                {t.vehiclePlate}
                              </span>
                            )}
                            {t.volumeLiters && t.volumeLiters > 0 && (
                              <span className="text-[11px] text-cyan-700 font-semibold flex items-center gap-0.5">
                                <Droplet className="w-2.5 h-2.5" />
                                {formatNumber(t.volumeLiters)} L
                              </span>
                            )}
                            {!t.vehiclePlate && (!t.volumeLiters || t.volumeLiters <= 0) && (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {t.description || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-sm whitespace-nowrap">
                          <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                            {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onOpenEditModal(t)}
                                title="Edit Transaksi"
                                className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRequestDelete(t)}
                                title="Hapus Transaksi"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
