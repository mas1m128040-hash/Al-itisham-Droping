import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  FileBarChart,
  Settings,
} from 'lucide-react';
import { ActivePage, User } from '../types';

interface MobileNavProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  currentUser: User | null;
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePage,
  onNavigate,
  currentUser,
  onOpenAddModal,
  onOpenMobileMenu,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activePage === 'dashboard' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Ringkasan</span>
        </button>

        {/* Transaksi */}
        <button
          onClick={() => onNavigate('transactions')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activePage === 'transactions' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Transaksi</span>
        </button>

        {/* Center Action: Plus for Admin or Quick Filter for Viewer */}
        <div className="flex items-center justify-center">
          {isAdmin ? (
            <button
              onClick={onOpenAddModal}
              className="w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 border-2 border-slate-900 active:scale-95 transition"
              aria-label="Tambah Transaksi"
            >
              <Plus className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('transactions')}
              className="w-10 h-10 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center border border-slate-700"
              title="Lihat Transaksi"
            >
              <ReceiptText className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Laporan */}
        <button
          onClick={() => onNavigate('reports')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activePage === 'reports' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FileBarChart className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Laporan</span>
        </button>

        {/* Pengaturan */}
        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center justify-center h-full transition ${
            activePage === 'settings' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Pengaturan</span>
        </button>
      </div>
    </nav>
  );
};
