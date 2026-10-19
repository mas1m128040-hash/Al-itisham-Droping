import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Save,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Truck,
  Droplet,
} from 'lucide-react';
import { Transaction, TransactionType, Category, User } from '../types';
import { formatRupiah, getTodayDateString } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trx: Omit<Transaction, 'id' | 'createdAt'> | Transaction) => Promise<void>;
  transactionToEdit?: Transaction | null;
  categories: Category[];
  currentUser: User | null;
  trucksList?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transactionToEdit,
  categories,
  currentUser,
  trucksList,
}) => {
  const isEditing = Boolean(transactionToEdit);
  const isAdmin = currentUser?.role === 'admin';

  const [date, setDate] = useState<string>(getTodayDateString());
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState<string>('Penjualan air');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [volumeLiters, setVolumeLiters] = useState<string>('');
  const [showOptionalDetails, setShowOptionalDetails] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Available categories based on selected type
  const availableCategories = categories.filter((c) => c.type === type);

  // Reset or fill form on open
  useEffect(() => {
    if (transactionToEdit) {
      setDate(transactionToEdit.date);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description || '');
      setVehiclePlate(transactionToEdit.vehiclePlate || '');
      setVolumeLiters(transactionToEdit.volumeLiters ? String(transactionToEdit.volumeLiters) : '');
      setShowOptionalDetails(Boolean(transactionToEdit.vehiclePlate || transactionToEdit.volumeLiters));
      setErrorMsg('');
    } else {
      setDate(getTodayDateString());
      setType('income');
      setCategory('Penjualan air');
      setAmount('');
      setDescription('');
      setVehiclePlate('');
      setVolumeLiters('');
      setShowOptionalDetails(false);
      setErrorMsg('');
    }
  }, [transactionToEdit, isOpen]);

  // Adjust default category when type switches
  useEffect(() => {
    if (!transactionToEdit) {
      // Ambil ulang kategori berdasarkan jenis transaksi yang sedang dipilih.
      // Bergantung pada categories juga memastikan form menyesuaikan saat data
      // kategori selesai dimuat dari Google Spreadsheet.
      const matchingCategories = categories.filter((c) => c.type === type);
      if (type === 'income') {
        const found = matchingCategories.find((c) => c.name.toLowerCase().includes('penjualan'));
        setCategory(found ? found.name : matchingCategories[0]?.name || '');
      } else {
        const found = matchingCategories.find((c) =>
          c.name.toLowerCase().includes('solar') || c.name.toLowerCase().includes('bahan baku')
        );
        setCategory(found ? found.name : matchingCategories[0]?.name || '');
      }
    }
  }, [type, transactionToEdit, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submits

    setErrorMsg('');

    if (!isAdmin) {
      setErrorMsg('Akses Ditolak: Hanya Admin yang dapat menyimpan transaksi!');
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih besar dari Rp 0.');
      return;
    }

    if (!date) {
      setErrorMsg('Tanggal transaksi wajib dipilih.');
      return;
    }

    if (!category) {
      setErrorMsg('Pilih kategori transaksi.');
      return;
    }

    const numVolume = volumeLiters ? parseInt(volumeLiters.replace(/[^0-9]/g, ''), 10) : undefined;

    setIsSubmitting(true);
    try {
      if (isEditing && transactionToEdit) {
        await onSubmit({
          ...transactionToEdit,
          date,
          type,
          category,
          amount: numAmount,
          description: description.trim(),
          vehiclePlate: vehiclePlate.trim().toUpperCase() || undefined,
          volumeLiters: numVolume,
        });
      } else {
        await onSubmit({
          date,
          type,
          category,
          amount: numAmount,
          description: description.trim(),
          vehiclePlate: vehiclePlate.trim().toUpperCase() || undefined,
          volumeLiters: numVolume,
          createdBy: currentUser?.username || 'admin',
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-4">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs">
              {isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {isEditing ? 'Ubah Transaksi' : 'Catat Transaksi'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single-Column Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Jenis Transaksi: Pemasukan vs Pengeluaran */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              1. Jenis Transaksi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-300" />
                Pengeluaran
              </button>
            </div>
          </div>

          {/* 2. Nominal Rupiah */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              2. Nominal (Rupiah) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-extrabold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1 text-[11px] font-bold text-cyan-700">
                {formatRupiah(parsedAmount)}
              </p>
            )}
          </div>

          {/* 3. Tanggal (Otomatis hari ini, bisa diubah) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              3. Tanggal <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* 4. Kategori */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              4. Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {availableCategories.length === 0 ? (
                <option value="">Kategori untuk jenis ini belum tersedia</option>
              ) : (
                availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 5. Keterangan Singkat (Opsional) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              5. Keterangan Singkat <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Isi tangki 8000L ke Hotel Grand / Solar Truk 1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Detail Tambahan (Plat Truk & Volume) - Disembunyikan dalam Accordion agar cepat */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptionalDetails((prev) => !prev)}
              className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200/70 rounded-lg text-slate-600 text-xs font-semibold flex items-center justify-between transition"
            >
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>Detail Armada & Liter (Opsional)</span>
              </div>
              {showOptionalDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showOptionalDetails && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 animate-in fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Plat Nomor Truk Tangki
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: B 9182 TGA"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs uppercase"
                  />
                  {trucksList && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {trucksList
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((truck) => (
                          <button
                            key={truck}
                            type="button"
                            onClick={() => {
                              // Extract plate and volume if formatted like "B 9182 TGA (8.000 L)"
                              const matchPlate = truck.match(/^([^(]+)/);
                              if (matchPlate) {
                                setVehiclePlate(matchPlate[1].trim());
                              } else {
                                setVehiclePlate(truck);
                              }
                              const matchVol = truck.match(/(\d+[\d.]*)\s*L/i);
                              if (matchVol) {
                                const cleanVol = matchVol[1].replace(/\./g, '');
                                setVolumeLiters(cleanVol);
                              }
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-800 transition"
                            title="Pilih armada ini"
                          >
                            {truck}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-cyan-600" />
                    <span>Volume Air Tangki (Liter)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 5000 atau 8000"
                    value={volumeLiters}
                    onChange={(e) => setVolumeLiters(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {['5000', '8000', '16000'].map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setVolumeLiters(vol)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50"
                      >
                        {vol} L
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan ke Sheets...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
