import React, { useMemo } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  Lock,
  Droplet,
  Fuel,
  Zap,
  Coffee,
  Wrench,
  Users,
  Waves,
  Building2,
  Tag,
} from 'lucide-react';
import { Category, Transaction, User } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CategoriesPageProps {
  categories: Category[];
  transactions: Transaction[];
  currentUser: User | null;
  onOpenAddModal: () => void;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  transactions,
  currentUser,
  onOpenAddModal,
  onDeleteCategory,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Compute category statistics (frequency and total amount)
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    categories.forEach((c) => {
      map.set(c.name, { count: 0, total: 0 });
    });

    transactions.forEach((t) => {
      if (map.has(t.category)) {
        const item = map.get(t.category)!;
        item.count += 1;
        item.total += t.amount;
      }
    });

    return map;
  }, [categories, transactions]);

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Droplets':
      case 'Droplet':
        return <Droplet className="w-4 h-4" />;
      case 'Fuel':
        return <Fuel className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Waves':
        return <Waves className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            Kategori Keuangan Usaha Tangki Air
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola pos pemasukan penjualan air dan pos pengeluaran operasional armada
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-cyan-600/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/70">
            Mode Viewer: Hanya dapat melihat daftar kategori
          </div>
        )}
      </div>

      {/* Grid: 2 columns (Pemasukan & Pengeluaran) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kategori Pemasukan */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Kategori Pemasukan
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {incomeCategories.length} Kategori
            </span>
          </div>

          <div className="space-y-2.5">
            {incomeCategories.map((cat) => {
              const stat = categoryStats.get(cat.name) || { count: 0, total: 0 };
              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {cat.name}
                        </span>
                        {cat.isSystem && (
                          <span
                            title="Kategori Bawaan Sistem (Tidak dapat dihapus)"
                            className="text-slate-400"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {stat.count} transaksi &bull; {formatRupiah(stat.total)}
                      </span>
                    </div>
                  </div>

                  {isAdmin && !cat.isSystem && (
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kategori Pengeluaran */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Kategori Pengeluaran
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {expenseCategories.length} Kategori
            </span>
          </div>

          <div className="space-y-2.5">
            {expenseCategories.map((cat) => {
              const stat = categoryStats.get(cat.name) || { count: 0, total: 0 };
              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {cat.name}
                        </span>
                        {cat.isSystem && (
                          <span
                            title="Kategori Bawaan Sistem (Tidak dapat dihapus)"
                            className="text-slate-400"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {stat.count} transaksi &bull; {formatRupiah(stat.total)}
                      </span>
                    </div>
                  </div>

                  {isAdmin && !cat.isSystem && (
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
