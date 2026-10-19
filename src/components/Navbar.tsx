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
  LayoutDashboard,
  ReceiptText,
  FileBarChart,
  TableProperties,
} from 'lucide-react';
import { User, ActivePage } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentUser: User | null;
  appName?: string;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
  isSheetsConnected: boolean;
  onOpenSpreadsheetModal: () => void;
  onOpenGuideModal: () => void;
  onOpenInstallModal?: () => void;
  isSyncing: boolean;
  onSyncNow: () => void;
  activePage: ActivePage;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  appName = 'TIRTA KEUANGAN',
  onLogout,
  onOpenMobileMenu,
  isSheetsConnected,
  onOpenSpreadsheetModal,
  onOpenGuideModal,
  onOpenInstallModal,
  isSyncing,
  onSyncNow,
  activePage,
}) => {
  const getPageTitle = (page: ActivePage) => {
    switch (page) {
      case 'dashboard':
        return { title: 'Dashboard Keuangan', icon: LayoutDashboard };
      case 'transactions':
        return { title: 'Daftar Transaksi', icon: ReceiptText };
      case 'reports':
        return { title: 'Laporan Rekapitulasi', icon: FileBarChart };
      case 'settings':
        return { title: 'Pengaturan Usaha & Spreadsheet', icon: TableProperties };
      default:
        return { title: 'Dashboard', icon: LayoutDashboard };
    }
  };

  const pageInfo = getPageTitle(activePage);
  const PageIcon = pageInfo.icon;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
      {/* Left: Mobile hamburger & title, Desktop current page indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none transition"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand (visible only on mobile when sidebar is hidden) */}
        <div className="flex items-center gap-2 md:hidden min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-xs shrink-0">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight truncate">
            {appName}
          </span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:flex items-center gap-2 text-slate-800">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <PageIcon className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-800 leading-tight">
              {pageInfo.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Actions, Connection Badge, PWA Install, Sync, User */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* PWA Install Button */}
        <PWAInstallButton
          variant="navbar"
          onOpenGuide={onOpenInstallModal}
        />

        {/* Spreadsheet Connection Status Badge */}
        <button
          type="button"
          onClick={onOpenSpreadsheetModal}
          title={
            isSheetsConnected
              ? 'Terhubung ke Google Spreadsheet (Klik untuk detail)'
              : 'Belum terhubung ke Spreadsheet (Klik untuk konfigurasi)'
          }
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isSheetsConnected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
          }`}
        >
          {isSheetsConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          )}
          <span className="hidden sm:inline">
            {isSheetsConnected ? 'Sheets Aktif' : 'Koneksi'}
          </span>
        </button>

        {/* Quick Sync Button for Admin */}
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            title="Sinkronkan data dengan Google Spreadsheet sekarang"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-600 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span className="hidden lg:inline">Sinkron</span>
          </button>
        )}

        {/* Guide Button */}
        <button
          type="button"
          onClick={onOpenGuideModal}
          title="Panduan Integrasi Google Apps Script & Deployment"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          aria-label="Panduan"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Role Pill */}
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold ${
                currentUser.role === 'admin'
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-3 h-3 text-cyan-600" />
              ) : (
                <Eye className="w-3 h-3 text-slate-500" />
              )}
              <span className="capitalize hidden sm:inline">{currentUser.role}</span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              title="Keluar dari akun"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
