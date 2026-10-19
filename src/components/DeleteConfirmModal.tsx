import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction: Transaction | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isDeleting,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-800">
            Hapus Transaksi Ini?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tindakan ini akan menghapus data transaksi dari sistem dan Google Spreadsheet.
          </p>

          {/* Transaction Summary Card */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-semibold text-slate-800">
                {formatDateIndo(transaction.date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kategori:</span>
              <span className="font-semibold text-slate-800">
                {transaction.category} ({transaction.type === 'income' ? 'Masuk' : 'Keluar'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nominal:</span>
              <span className="font-bold text-rose-600 text-sm">
                {formatRupiah(transaction.amount)}
              </span>
            </div>
            {transaction.description && (
              <div className="pt-1 border-t border-slate-200/60 text-slate-600 italic">
                "{transaction.description}"
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Transaksi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
