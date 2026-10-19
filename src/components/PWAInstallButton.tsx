import React from 'react';
import { Download, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenGuide?: () => void;
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenGuide,
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res === 'manual' && onOpenGuide) {
        onOpenGuide();
      }
    } else if (onOpenGuide) {
      onOpenGuide();
    }
  };

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/50 text-cyan-300 hover:text-white hover:border-cyan-500/60 transition group ${className}`}
        title="Pasang aplikasi di Google Chrome / Layar Utama"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-cyan-900/60 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-200 group-hover:text-cyan-300 leading-tight">
              {isInstallable ? 'Pasang Aplikasi' : 'Instal di Chrome'}
            </p>
            <p className="text-[10px] text-slate-400">PWA Layar Beranda</p>
          </div>
        </div>
        {isInstallable ? (
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        ) : (
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
        )}
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition active:scale-98 ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{isInstallable ? 'Instal Sekarang ke Perangkat' : 'Petunjuk Pasang di Chrome'}</span>
      </button>
    );
  }

  // Navbar default variant
  return (
    <button
      type="button"
      onClick={handleClick}
      title="Pasang aplikasi di HP atau Komputer (Google Chrome)"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition active:scale-95 ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      <span className="hidden sm:inline">
        {isInstallable ? 'Pasang App' : 'Instal App'}
      </span>
      {isInstallable && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline" />
      )}
    </button>
  );
};
