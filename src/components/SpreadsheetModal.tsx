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
  const [url, setUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    title?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(AppApiService.getAppsScriptUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await AppApiService.testConnection(url);
      setTestResult(res);
      if (res.success && isAdmin) {
        AppApiService.setAppsScriptUrl(url);
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
      alert('Hanya Admin yang dapat menyimpan pengaturan Google Spreadsheet.');
      return;
    }

    AppApiService.setAppsScriptUrl(url);
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
          {/* Status Info Banner */}
          <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-cyan-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              <span>Penyimpanan Aman & Realtime</span>
            </div>
            Setiap transaksi yang dicatat admin akan langsung masuk ke lembar Google Spreadsheet Anda secara otomatis via Apps Script API.
          </div>

          {/* Web App URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                URL Web App Google Apps Script
              </label>
              <button
                type="button"
                onClick={onOpenGuideModal}
                className="text-cyan-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <BookOpen className="w-3 h-3" />
                <span>Lihat Panduan Setup</span>
              </button>
            </div>
            <textarea
              rows={2}
              disabled={!isAdmin}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dapatkan URL ini setelah menerapkan (deploy) Web App di Google Apps Script dengan akses "Anyone".
            </p>
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !url.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Koneksi...' : 'Tes Koneksi'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Uji respons server Google
            </span>
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

          {!isAdmin && (
            <p className="p-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px]">
              Perhatian: Anda masuk sebagai Viewer. Hanya Admin yang dapat mengubah konfigurasi URL Google Apps Script.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl"
          >
            Tutup
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSyncing || !url.trim()}
              className="px-5 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simpan & Sinkronkan Data</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
