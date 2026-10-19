import React, { useState } from 'react';
import {
  Droplets,
  ShieldCheck,
  Eye,
  Lock,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { AppApiService } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  appName?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, appName = 'TIRTA KEUANGAN' }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const gasUrl = AppApiService.getAppsScriptUrl();

      // If Google Apps Script is configured, try remote login first
      if (gasUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'login',
              username,
              password,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.user) {
              AuthService.setCurrentUser(json.user);
              onLoginSuccess(json.user);
              return;
            }
          }
        } catch {
          // If network / timeout fails, proceed to local check
        }
      }

      // Local authentication check
      const authResult = AuthService.authenticateLocal(username, password);
      if (authResult.success && authResult.user) {
        onLoginSuccess(authResult.user);
      } else {
        setErrorMsg(authResult.message || 'Kredensial tidak valid');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi gangguan saat proses masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (user: 'admin' | 'viewer') => {
    if (user === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('viewer');
      setPassword('viewer123');
    }
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 text-white shadow-xl shadow-cyan-500/25 mb-4">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {appName}
          </h1>
          <p className="text-sm text-cyan-200/80 mt-1">
            Manajemen Keuangan & Operasional Tangki Air
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              Masuk ke Aplikasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih hak akses Admin atau Viewer untuk mengelola kas operasional
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau viewer"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Pilihan Cepat Akun Demo / Uji Coba:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="p-2.5 rounded-xl border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100/70 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Akun Admin</span>
                </div>
                <p className="text-[10px] text-cyan-700/80 mt-0.5">
                  admin / admin123
                </p>
                <p className="text-[10px] text-cyan-950 font-medium mt-1">
                  &bull; Tambah, Edit, Hapus, Ekspor
                </p>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('viewer')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Akun Viewer</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  viewer / viewer123
                </p>
                <p className="text-[10px] text-slate-600 font-medium mt-1">
                  &bull; Hanya lihat grafik & laporan
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Tersinkronisasi dengan Google Spreadsheet Database</span>
        </div>
      </div>
    </div>
  );
};
