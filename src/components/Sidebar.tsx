import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  FileBarChart,
  TableProperties,
  BookOpen,
  X,
  Droplets,
  PlusCircle,
  ShieldCheck,
  Eye,
  Download,
  LogOut,
} from 'lucide-react';
import { ActivePage, User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: User | null;
  appName?: string;
  onOpenAddModal?: () => void;
  onOpenGuideModal: () => void;
  onOpenInstallModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  appName = 'TIRTA KEUANGAN',
  onOpenAddModal,
  onOpenGuideModal,
  onOpenInstallModal,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions' as ActivePage,
      label: 'Transaksi',
      icon: ReceiptText,
    },
    {
      id: 'reports' as ActivePage,
      label: 'Laporan',
      icon: FileBarChart,
    },
    {
      id: 'settings' as ActivePage,
      label: 'Pengaturan',
      icon: TableProperties,
    },
  ];

  const handleItemClick = (page: ActivePage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Brand Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-cyan-500/30 shrink-0">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <h2 className="font-extrabold text-sm text-white tracking-tight truncate" title={appName}>
              {appName}
            </h2>
            <p className="text-[10px] text-slate-400 truncate">
              Manajemen Tangki Air
            </p>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Add Button for Admin */}
      {isAdmin && onOpenAddModal && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              onOpenAddModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/20 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      )}

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
          Menu Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-colors text-left ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}

        {/* Section: Bantuan & PWA */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
            Aplikasi & Bantuan
          </div>

          {/* PWA Install Button in Sidebar */}
          <PWAInstallButton
            variant="sidebar"
            onOpenGuide={() => {
              if (onOpenInstallModal) onOpenInstallModal();
              onCloseMobile();
            }}
          />

          {/* Panduan Modal Button */}
          <button
            type="button"
            onClick={() => {
              onOpenGuideModal();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Panduan Deployment</span>
          </button>
        </div>
      </nav>

      {/* Admin Profile Footer - Always Docked at Bottom */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isAdmin ? 'bg-cyan-900/60 text-cyan-400' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate leading-tight">
                {currentUser?.name || 'Pengguna'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                {isAdmin ? 'Admin (Akses Penuh)' : 'Viewer (Lihat Saja)'}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Keluar dari akun"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isAdmin && (
          <div className="mt-2 text-[10px] text-amber-300 bg-amber-950/50 px-2 py-1 rounded border border-amber-900/60">
            Mode Lihat Saja. Tidak dapat mengedit data.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Fixed 256px wide, full height) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-800 z-20">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Panel */}
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200 border-r border-slate-800">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
