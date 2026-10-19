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
} from 'lucide-react';
import { ActivePage, User } from '../types';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: User | null;
  onOpenAddModal?: () => void;
  onOpenGuideModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onOpenAddModal,
  onOpenGuideModal,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions' as ActivePage,
      label: 'Transaksi',
      icon: ReceiptText,
      badge: null,
    },
    {
      id: 'reports' as ActivePage,
      label: 'Laporan',
      icon: FileBarChart,
      badge: null,
    },
    {
      id: 'settings' as ActivePage,
      label: 'Pengaturan',
      icon: TableProperties,
      badge: null,
    },
  ];

  const handleItemClick = (page: ActivePage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Mobile Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">TIRTA TANGKI AIR</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Add Button for Admin */}
      {isAdmin && onOpenAddModal && (
        <div className="p-4 pb-2">
          <button
            onClick={() => {
              onOpenAddModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-medium rounded-xl shadow-lg shadow-cyan-600/20 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      )}

      {/* Main Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors text-left ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    item.badge === 'PDF / CSV'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
            Bantuan
          </div>
          <button
            onClick={() => {
              onOpenGuideModal();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
          >
            <BookOpen className="w-5 h-5 text-slate-400" />
            <span>Panduan Deployment</span>
          </button>
        </div>
      </nav>

      {/* Role Access Information Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
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
            <p className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.name || 'Tamu'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {isAdmin
                ? 'Hak Akses Penuh (Admin)'
                : 'Mode Lihat Saja (Viewer)'}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <div className="mt-2 text-[10px] text-amber-400/90 bg-amber-950/40 p-1.5 rounded border border-amber-900/50">
            Akun Viewer tidak dapat menambah, mengedit, atau menghapus transaksi.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Panel */}
          <div className="relative w-4/5 max-w-xs h-full bg-slate-900 shadow-2xl z-10 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
