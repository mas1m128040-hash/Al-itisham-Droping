import React, { useState, useEffect } from 'react';
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
  Save,
  Download,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { AppApiService } from '../services/api';
import { Category, User, BusinessProfile } from '../types';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface SettingsPageProps {
  currentUser: User | null;
  categories: Category[];
  onOpenAddCategoryModal: () => void;
  onDeleteCategory: (id: string) => Promise<void>;
  onOpenGuideModal: () => void;
  onSyncSuccess: () => void;
  isSheetsConnected: boolean;
  businessProfile: BusinessProfile;
  onSaveBusinessProfile: (profile: BusinessProfile) => Promise<{ success: boolean; message: string }>;
  onOpenInstallModal?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  categories,
  onOpenAddCategoryModal,
  onDeleteCategory,
  onOpenGuideModal,
  onSyncSuccess,
  isSheetsConnected,
  businessProfile,
  onSaveBusinessProfile,
  onOpenInstallModal,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Spreadsheet state
  const [gasUrl, setGasUrl] = useState(() => AppApiService.getAppsScriptUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    title?: string;
  } | null>(null);

  // Business profile form state
  const [appName, setAppName] = useState(businessProfile.appName);
  const [businessName, setBusinessName] = useState(businessProfile.businessName);
  const [businessAddress, setBusinessAddress] = useState(businessProfile.address);
  const [trucks, setTrucks] = useState(businessProfile.trucks);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // Sync state if businessProfile prop changes
  useEffect(() => {
    setAppName(businessProfile.appName);
    setBusinessName(businessProfile.businessName);
    setBusinessAddress(businessProfile.address);
    setTrucks(businessProfile.trucks);
  }, [businessProfile]);

  // Handle saving business profile to Google Spreadsheet (sheet Pengaturan)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin yang berhak menyimpan perubahan pengaturan profil usaha.');
      return;
    }

    if (!appName.trim()) {
      alert('Nama aplikasi tidak boleh kosong.');
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveSuccess(null);
    setProfileSaveError(null);

    const updatedProfile: BusinessProfile = {
      appName: appName.trim(),
      businessName: businessName.trim() || "Al I'tisham Droping",
      address: businessAddress.trim(),
      trucks: trucks.trim(),
    };

    try {
      const res = await onSaveBusinessProfile(updatedProfile);
      if (res.success) {
        setProfileSaveSuccess(res.message || 'Pengaturan nama aplikasi & profil usaha berhasil disimpan ke Google Spreadsheet!');
        setTimeout(() => {
          setProfileSaveSuccess(null);
        }, 5000);
      } else {
        setProfileSaveError(res.message || 'Gagal menyimpan pengaturan ke server Google Spreadsheet.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setProfileSaveError(`Gagal menyimpan: ${errorMsg}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle testing GAS connection
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

  // Handle saving URL and triggering sync
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
    <div className="space-y-4 max-w-4xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
            Pengaturan Usaha & Integrasi
          </h2>
          <p className="text-xs text-slate-500">
            Nama Aplikasi, Profil Usaha Tangki Air, Google Spreadsheet & Kategori
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

      {/* 1. Pengaturan Nama Aplikasi & Profil Usaha (Dengan Tombol Simpan Jelas) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Pengaturan Nama Aplikasi & Profil Usaha
              </h3>
              <p className="text-[11px] text-slate-400">
                Sesuaikan nama tampilan aplikasi dan informasi usaha untuk kop laporan
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAdmin
                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isAdmin ? 'Mode Edit Admin' : 'Hanya Lihat'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nama Tampilan Aplikasi */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Tampilan Aplikasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Contoh: TIRTA KEUANGAN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tampil di judul header navigasi, menu samping, dan tab browser.
              </p>
            </div>

            {/* Nama Resmi Perusahaan / Usaha Air */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Usaha / Perusahaan Lengkap
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Contoh: CV. Tirta Lancar Abadi (Tangki Air)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dicetak pada kop surat Laporan PDF dan file ekspor CSV.
              </p>
            </div>

            {/* Alamat Depo / Pangkalan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Alamat Depo / Sumber Mata Air
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Contoh: Jl. Raya Sumber Air No. 45, Bogor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Alamat pangkalan atau sumber pengisian tangki air.
              </p>
            </div>

            {/* Daftar Armada Truk Tangki */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-cyan-600" />
                <span>Daftar Armada Truk Tangki</span>
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={trucks}
                onChange={(e) => setTrucks(e.target.value)}
                placeholder="Contoh: B 9182 TGA (8.000 L), B 9234 TAB (5.000 L)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Pisahkan dengan koma untuk pilihan cepat saat input transaksi.
              </p>
            </div>
          </div>

          {/* Feedback Banner on Profile Save */}
          {profileSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">{profileSaveSuccess}</span>
            </div>
          )}

          {profileSaveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">{profileSaveError}</span>
            </div>
          )}

          {/* Tombol Simpan Pengaturan Usaha */}
          {isAdmin && (
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan Usaha</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. Google Spreadsheet & Apps Script Configuration Card */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
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
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
              isSheetsConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isSheetsConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{isSheetsConnected ? 'Terkoneksi' : 'Offline / Lokal'}</span>
          </span>
        </div>

        {/* URL Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              URL Web App Apps Script
            </label>
            {AppApiService.isConfigured() && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Otomatis Default Aktif
              </span>
            )}
          </div>
          <textarea
            rows={2}
            disabled={!isAdmin}
            value={gasUrl}
            onChange={(e) => setGasUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60"
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>Ditanam otomatis untuk seluruh browser & HP.</span>
            {gasUrl && (
              <button
                type="button"
                onClick={() => {
                  AppApiService.setAppsScriptUrl('');
                  setGasUrl(AppApiService.getAppsScriptUrl());
                }}
                className="text-cyan-600 hover:underline font-semibold"
              >
                Reset ke Default
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !gasUrl.trim()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Menguji...' : 'Tes Koneksi'}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSyncing || !gasUrl.trim()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan & Sinkronkan</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
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

      {/* 3. PWA & Pemasangan Aplikasi di Chrome */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Instalasi Aplikasi di Chrome (PWA)
              </h3>
              <p className="text-[11px] text-slate-400">
                Dapat dipasang di layar utama HP Android, iPhone, dan Komputer
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>PWA Ready</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Aplikasi ini mendukung Progressive Web App (PWA). Anda dapat memasangnya langsung melalui
          Google Chrome tanpa perlu unduh dari Play Store, sehingga hemat memori dan bisa dibuka layaknya
          aplikasi native.
        </p>

        <div className="pt-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Buka Petunjuk / Pasang Aplikasi</span>
          </button>
        </div>
      </div>

      {/* 4. Kelola Kategori Keuangan Usaha Tangki Air */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
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
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1.5">
              Pemasukan (Income):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories
                .filter((c) => c.type === 'income')
                .map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                    {cat.isSystem ? (
                      <span title="Kategori Sistem Baku">
                        <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                      </span>
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
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )
                    )}
                  </span>
                ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
              Pengeluaran (Expense):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                    {cat.isSystem ? (
                      <span title="Kategori Sistem Baku">
                        <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                      </span>
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
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )
                    )}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Hak Akses Pengguna */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <KeyRound className="w-4 h-4 text-cyan-600" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Status Akun & Hak Akses
          </h3>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isAdmin ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                {currentUser?.name}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAdmin
                ? 'Hak Akses Admin: Menambah, mengubah, menghapus transaksi, mengelola kategori, dan mengunduh laporan.'
                : 'Hak Akses Viewer: Hanya dapat melihat dashboard dan laporan (tanpa hak edit atau hapus).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
