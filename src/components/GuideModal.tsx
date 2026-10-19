import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  TableProperties,
  Key,
  Globe,
  Terminal,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'vercel' | 'github'>('sheets');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    // We fetch or copy the core Code.gs snippet
    const gasSnippet = `// Buka file /google-apps-script/Code.gs di repositori ini untuk melihat seluruh kode lengkap.
// Kode tersebut sudah siap digunakan dan otomatis membuat sheet Transaksi, Kategori, dan Users!`;
    navigator.clipboard.writeText(gasSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Panduan Integrasi Google Sheets, GitHub & Vercel
              </h3>
              <p className="text-[11px] text-slate-400">
                Setup Lengkap Sistem Manajemen Keuangan Tangki Air
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sheets'
                ? 'border-cyan-600 text-cyan-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>1. Google Spreadsheet & GAS</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'vercel'
                ? 'border-cyan-600 text-cyan-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Deploy ke Vercel</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'github'
                ? 'border-cyan-600 text-cyan-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Push ke GitHub</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 flex items-start gap-2.5">
                <TableProperties className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-cyan-900 text-xs">
                    File kode lengkap sudah tersedia di folder:
                  </p>
                  <code className="text-cyan-800 bg-cyan-100 px-1 py-0.5 rounded text-[11px] font-mono">
                    /google-apps-script/Code.gs
                  </code>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 font-medium">
                <li>
                  Buka{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-600 underline font-bold inline-flex items-center gap-0.5"
                  >
                    Google Spreadsheet Baru <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  dan beri nama misalnya: <strong>"Keuangan Tangki Air Tirta"</strong>.
                </li>
                <li>
                  Klik menu <strong>Extensions (Ekstensi)</strong> &rarr;{' '}
                  <strong>Apps Script</strong>.
                </li>
                <li>
                  Hapus semua kode bawaan di editor Apps Script, lalu salin seluruh isi dari file{' '}
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-900">
                    google-apps-script/Code.gs
                  </span>
                  .
                </li>
                <li>
                  Klik tombol <strong>Deploy (Terapkan)</strong> &rarr;{' '}
                  <strong>New deployment (Penerapan baru)</strong>.
                </li>
                <li>
                  Pilih jenis <strong>Web app (Aplikasi web)</strong>:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-600 font-normal">
                    <li>
                      <strong>Execute as (Jalankan sebagai):</strong> Me (Email Google Anda)
                    </li>
                    <li>
                      <strong className="text-rose-600">Who has access (Siapa yang memiliki akses):</strong>{' '}
                      <strong>Anyone (Siapa saja)</strong> &larr; <em>Wajib agar web bisa berkomunikasi tanpa login Google terpisah</em>
                    </li>
                  </ul>
                </li>
                <li>
                  Klik <strong>Deploy</strong>, izinkan hak akses akun Google jika diminta.
                </li>
                <li>
                  Salin <strong>Web App URL</strong> yang berakhiran{' '}
                  <code className="bg-slate-100 px-1 rounded font-mono text-cyan-700">/exec</code>.
                </li>
                <li>
                  Tempel URL tersebut ke menu <strong>Google Spreadsheet</strong> di aplikasi ini, lalu klik <strong>"Tes Koneksi"</strong> dan <strong>"Simpan & Sinkronkan"</strong>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Langkah Konfigurasi & Deploy ke Vercel:
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 font-medium">
                <li>
                  Login ke dashboard{' '}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-600 underline font-bold inline-flex items-center gap-0.5"
                  >
                    Vercel.com <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  menggunakan akun GitHub Anda.
                </li>
                <li>
                  Klik <strong>"Add New..." &rarr; "Project"</strong>, lalu impor repositori GitHub yang sudah Anda buat.
                </li>
                <li>
                  Pada bagian <strong>Environment Variables</strong> di konfigurasi Vercel, tambahkan:
                  <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                    <p className="text-cyan-400 font-bold">Key: VITE_APPS_SCRIPT_URL</p>
                    <p className="text-slate-400">Value: https://script.google.com/macros/s/AKfycb.../exec</p>
                  </div>
                </li>
                <li>
                  Biarkan Framework Preset sebagai <strong>Vite</strong> dan Build Command:{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-cyan-700">npm run build</code>.
                </li>
                <li>
                  Klik tombol <strong>"Deploy"</strong>. Dalam hitungan detik, aplikasi web Anda langsung online dengan domain gratis seperti{' '}
                  <code className="bg-slate-100 px-1 rounded text-slate-800">manajemen-tangki-air.vercel.app</code>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Perintah Terminal untuk Push ke GitHub:
              </h4>
              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
                <p className="text-slate-400"># 1. Inisialisasi Git (jika belum)</p>
                <p className="text-cyan-400">git init</p>
                <p className="text-cyan-400">git add .</p>
                <p className="text-cyan-400">git commit -m "feat: Aplikasi Manajemen Keuangan Tangki Air Siap Deploy"</p>
                <p className="text-slate-400"># 2. Hubungkan ke repositori GitHub Anda</p>
                <p className="text-cyan-400">git remote add origin https://github.com/USERNAME/manajemen-keuangan-tangki-air.git</p>
                <p className="text-cyan-400">git branch -M main</p>
                <p className="text-cyan-400">git push -u origin main</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <p className="font-semibold">Keamanan Kredensial:</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  File <code className="font-mono">.gitignore</code> dan <code className="font-mono">.env.example</code> sudah dikonfigurasi rapi sehingga tidak ada token rahasia yang bocor ke publik.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Dapat dibuka kapan saja melalui menu samping
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-xs transition"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
