import React from 'react';
import {
  Droplets,
  Menu,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { User, ActivePage } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
  isSheetsConnected: boolean;
  onOpenSpreadsheetModal: () => void;
  onOpenGuideModal: () => void;
  isSyncing: boolean;
  onSyncNow: () => void;
  activePage: ActivePage;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenMobileMenu,
  isSheetsConnected,
  onOpenSpreadsheetModal,
  onOpenGuideModal,
  isSyncing,
  onSyncNow,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="font-extrabold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1">
                  TIRTA KEUANGAN
                </h1>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Manajemen Tangki Air
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spreadsheet Connection Badge */}
            <button
              onClick={onOpenSpreadsheetModal}
              title={
                isSheetsConnected
                  ? 'Terhubung ke Google Spreadsheet'
                  : 'Klik untuk menghubungkan ke Google Spreadsheet'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSheetsConnected
                  ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/50 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              {isSheetsConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="hidden md:inline">
                {isSheetsConnected ? 'Google Sheets Aktif' : 'Koneksi Spreadsheet'}
              </span>
              <span className="md:hidden">
                {isSheetsConnected ? 'Sheets' : 'Koneksi'}
              </span>
            </button>

            {/* Quick Sync Button */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                title="Sinkronkan data dengan Google Spreadsheet"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span className="hidden lg:inline">Sinkronisasi</span>
              </button>
            )}

            {/* Guide Button */}
            <button
              onClick={onOpenGuideModal}
              title="Panduan Setup Google Spreadsheet & Apps Script"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Role Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                    currentUser.role === 'admin'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="capitalize">{currentUser.role}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
