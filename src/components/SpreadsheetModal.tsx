import React, { useState, useEffect } from 'react';
import {
  X,
  TableProperties,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Send,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppApiService } from '../services/api';
import { User } from '../types';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSyncSuccess: () => void;
  onOpenGuideModal: () => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSyncSuccess,
  onOpenGuideModal,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeUrl, setActiveUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showAdvancedEdit, setShowAdvancedEdit] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    title?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = AppApiService.getAppsScriptUrl();
      setActiveUrl(current);
      setCustomUrlInput(current);
      setTestResult(null);
      // Auto open input only if URL is not configured yet
      setShowAdvancedEdit(!current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfigured = Boolean(activeUrl && activeUrl.startsWith('https://script.google.com/macros/s/'));

  const handleTestConnection = async () => {
    const urlToTest = (showAdvancedEdit && customUrlInput.trim()) ? customUrlInput.trim() : activeUrl;
    if (!urlToTest) {
      setTestResult({
        success: false,
        message: 'URL Google Apps Script belum tersedia. Masukkan URL Web App terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await AppApiService.testConnection(urlToTest);
      setTestResult(res);
      if (res.success && isAdmin && showAdvancedEdit && customUrlInput.trim()) {
        AppApiService.setAppsScriptUrl(customUrlInput.trim());
        setActiveUrl(customUrlInput.trim());
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Gagal melakukan tes: ' + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang dapat menyimpan pengaturan Google Spreadsheet.');
      return;
    }

    const urlToUse = (showAdvancedEdit && customUrlInput.trim()) ? customUrlInput.trim() : activeUrl;
    if (showAdvancedEdit && customUrlInput.trim()) {
      AppApiService.setAppsScriptUrl(customUrlInput.trim());
      setActiveUrl(customUrlInput.trim());
    }

    setIsSyncing(true);
    try {
      if (currentUser) {
        const res = await AppApiService.syncAllToSpreadsheet(currentUser);
        if (res.success) {
          alert('Berhasil! Seluruh data transaksi lokal telah disinkronkan ke Google Spreadsheet.');
          onSyncSuccess();
          onClose();
        } else {
          alert(res.message);
        }
      }
    } catch (err) {
      alert('Terjadi kesalahan sinkronisasi: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Koneksi Google Spreadsheet
              </h3>
              <p className="text-xs text-slate-500">
                Database Utama & Google Apps Script API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Automatic Connection Banner */}
          {isConfigured ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Backend Apps Script Siap & Terhubung Otomatis</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-normal">
                Aplikasi telah terhubung ke Google Apps Script tanpa perlu memasukkan URL secara manual setiap membuka di HP atau browser baru.
              </p>
              <div className="bg-white/90 px-3 py-1.5 rounded-lg border border-emerald-200 font-mono text-[10px] text-slate-600 break-all truncate">
                {activeUrl}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>URL Apps Script Belum Terkonfigurasi</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Silakan tempel URL Web App dari Google Apps Script di bawah atau atur melalui environment variable <code>VITE_APPS_SCRIPT_URL</code> di Vercel.
              </p>
            </div>
          )}

          {/* Quick Actions for Testing & Sync */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || (!activeUrl && !customUrlInput.trim())}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Server...' : 'Uji Koneksi Server'}</span>
            </button>

            {isAdmin && isConfigured && (
              <button
                type="button"
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs shadow-xs"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sinkronisasi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Sinkronkan Sekarang</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenGuideModal}
              className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold text-xs ml-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Setup</span>
            </button>
          </div>

          {/* Test Feedback Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in ${
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
                    Nama Spreadsheet: <strong>{testResult.title}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Optional Collapsible URL Editor (For developers / admins who want to change URL) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvancedEdit(!showAdvancedEdit)}
              className="flex items-center justify-between w-full text-left font-bold text-slate-600 hover:text-slate-900 py-1"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Pengaturan Lanjutan: Ubah URL Apps Script</span>
              </span>
              {showAdvancedEdit ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvancedEdit && (
              <div className="mt-2 space-y-2 animate-in fade-in">
                <textarea
                  rows={2}
                  disabled={!isAdmin}
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Deploy di Apps Script dengan akses: Anyone (Siapa saja)</span>
                  {customUrlInput !== activeUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomUrlInput(activeUrl)}
                      className="text-cyan-600 hover:underline font-semibold"
                    >
                      Batal Ubah
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isAdmin && (
            <p className="p-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px]">
              Status Akun: Viewer (Mode Lihat Saja). Hanya Admin yang memiliki hak menyimpan perubahan koneksi atau memicu sinkronisasi manual.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs"
          >
            Tutup
          </button>
          {isAdmin && showAdvancedEdit && customUrlInput !== activeUrl && customUrlInput.trim() && (
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSyncing}
              className="px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan URL Baru</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
