import React from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share,
  MoreVertical,
  PlusSquare,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  appName = 'TIRTA KEUANGAN',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const result = await install();
    if (result === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Pasang / Install Aplikasi
              </h3>
              <p className="text-[11px] text-cyan-200">
                PWA: Akses cepat dari layar utama HP & Laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
          {/* Status Banner */}
          {isInstalled ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Aplikasi Telah Terpasang (Standalone)</p>
                <p className="text-[11px] text-emerald-700">
                  Aplikasi sedang berjalan dalam mode aplikasi mandiri di perangkat Anda.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-3.5 bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-900 font-bold">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Siap Dipasang Melalui Google Chrome</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Browser Anda mendukung instalasi langsung. Klik tombol di bawah untuk memasang{' '}
                <strong>{appName}</strong> ke layar beranda HP atau desktop komputer Anda.
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-xl shadow-md shadow-cyan-600/25 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Instal Aplikasi Sekarang</span>
              </button>
            </div>
          ) : null}

          {/* Panduan Chrome di Android / Laptop */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Smartphone className="w-4 h-4 text-cyan-600" />
              <Laptop className="w-4 h-4 text-cyan-600" />
              <span>Cara Pasang di Google Chrome (Android & Laptop)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  Buka aplikasi ini di <strong>Google Chrome</strong> pada HP Android atau komputer Anda.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p className="flex items-center gap-1 flex-wrap">
                  Klik menu titik tiga{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px]">
                    <MoreVertical className="w-3 h-3 inline mr-0.5" /> Menu
                  </span>{' '}
                  di pojok kanan atas browser (atau ikon install di bilah alamat URL laptop).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Pilih menu <strong>"Pasang aplikasi"</strong> atau{' '}
                  <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <p>
                  Aplikasi akan langsung muncul seperti aplikasi bawaan (native) tanpa bilah browser.
                </p>
              </div>
            </div>
          </div>

          {/* Panduan iPhone / iPad (iOS Safari) */}
          {(isIOS || !isInstallable) && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Share className="w-4 h-4 text-cyan-600" />
                <span>Cara Pasang di iPhone / iPad (Safari)</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <p>Buka halaman ini menggunakan browser Safari di iPhone/iPad Anda.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <p className="flex items-center gap-1 flex-wrap">
                    Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas{' '}
                    <Share className="w-3 h-3 inline" />).
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <p className="flex items-center gap-1 flex-wrap">
                    Gulir ke bawah dan pilih{' '}
                    <strong>
                      <PlusSquare className="w-3 h-3 inline mr-1" />
                      Add to Home Screen
                    </strong>{' '}
                    (Tambah ke Layar Utama).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
