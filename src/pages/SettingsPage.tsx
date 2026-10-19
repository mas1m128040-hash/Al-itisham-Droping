import React, { useState } from 'react';
import {
  TableProperties,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  BookOpen,
  Truck,
  Building,
  ShieldCheck,
  Eye,
  KeyRound,
  Tag,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { AppApiService } from '../services/api';
import { Category, User } from '../types';

interface SettingsPageProps {
  currentUser: User | null;
  categories: Category[];
  onOpenAddCategoryModal: () => void;
  onDeleteCategory: (id: string) => Promise<void>;
  onOpenGuideModal: () => void;
  onSyncSuccess: () => void;
  isSheetsConnected: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  categories,
  onOpenAddCategoryModal,
  onDeleteCategory,
  onOpenGuideModal,
  onSyncSuccess,
  isSheetsConnected,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [gasUrl, setGasUrl] = useState(AppApiService.getAppsScriptUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    title?: string;
  } | null>(null);

  const [businessName, setBusinessName] = useState('CV. Tirta Lancar Abadi (Tangki Air)');
  const [businessAddress, setBusinessAddress] = useState('Jl. Raya Sumber Mata Air No. 45, Bogor');
  const [trucks, setTrucks] = useState('B 9182 TGA (8.000 L), B 9234 TAB (5.000 L), B 9801 XYZ (16.000 L)');

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await AppApiService.testConnection(gasUrl);
      setTestResult(res);
      if (res.success && isAdmin) {
        AppApiService.setAppsScriptUrl(gasUrl);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Gagal menghubungi: ' + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang dapat memperbarui pengaturan.');
      return;
    }

    AppApiService.setAppsScriptUrl(gasUrl);
    setIsSyncing(true);
    try {
      if (currentUser) {
        const res = await AppApiService.syncAllToSpreadsheet(currentUser);
        if (res.success) {
          alert('Berhasil tersinkronisasi! ' + res.message);
          onSyncSuccess();
        } else {
          alert(res.message);
        }
      }
    } catch (err) {
      alert('Gagal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16 md:pb-8">
      {/* Top Banner */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
            Pengaturan & Integrasi
          </h2>
          <p className="text-xs text-slate-500">
            Google Spreadsheet, Kategori Usaha & Hak Akses
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenGuideModal}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Panduan Setup</span>
        </button>
      </div>

      {/* 1. Google Spreadsheet & Apps Script Configuration Card */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <TableProperties className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Koneksi Google Apps Script & Spreadsheet
              </h3>
              <p className="text-[11px] text-slate-400">
                Database utama penyimpanan data transaksi
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
              isSheetsConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isSheetsConnected ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-600" />
            )}
            <span>{isSheetsConnected ? 'Terkoneksi' : 'Offline / Lokal'}</span>
          </span>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            URL Web App Apps Script
          </label>
          <textarea
            rows={2}
            disabled={!isAdmin}
            value={gasUrl}
            onChange={(e) => setGasUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !gasUrl.trim()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Menguji...' : 'Tes Koneksi'}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSyncing || !gasUrl.trim()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Simpan & Sinkronkan</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-2.5 rounded-lg border flex items-start gap-2 text-xs animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.message}</p>
              {testResult.title && (
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  File Spreadsheet: <strong>{testResult.title}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Kelola Kategori Keuangan Usaha Tangki Air */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Kategori Pemasukan & Pengeluaran
              </h3>
              <p className="text-[11px] text-slate-400">
                Pos keuangan operasional armada dan suplai air
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddCategoryModal}
              className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          )}
        </div>

        {/* Category List Pills */}
        <div className="space-y-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Pemasukan:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories
                .filter((c) => c.type === 'income')
                .map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                    {cat.isSystem ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                    ) : (
                      isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus kategori "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="hover:text-rose-600 ml-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )
                    )}
                  </span>
                ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
              Pengeluaran:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                    {cat.isSystem ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                    ) : (
                      isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus kategori "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="hover:text-rose-600 ml-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )
                    )}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Profil Usaha & Armada */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building className="w-4 h-4 text-cyan-600" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Profil Usaha & Armada Tangki Air
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-0.5">
              Nama Usaha / Usaha Air
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-0.5">
              Alamat Depo / Mata Air
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-0.5 flex items-center gap-1">
              <Truck className="w-3 h-3 text-cyan-600" />
              <span>Daftar Armada Truk Tangki</span>
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={trucks}
              onChange={(e) => setTrucks(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* 4. Hak Akses Pengguna */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <KeyRound className="w-4 h-4 text-cyan-600" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Status Akun & Hak Akses
          </h3>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isAdmin ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 text-xs">{currentUser?.name}</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAdmin
                ? 'Hak Akses Admin: Menambah, mengubah, menghapus transaksi, dan mengunduh laporan.'
                : 'Hak Akses Viewer: Hanya dapat melihat dashboard dan laporan (tanpa hak edit).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
