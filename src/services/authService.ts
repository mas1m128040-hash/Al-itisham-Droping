import { User, UserRole } from '../types';

const STORAGE_KEY = 'tangki_air_auth_user';

export const AuthService = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },

  isViewer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'viewer';
  },

  /**
   * Local verification fallback if Google Apps Script is not configured or offline
   */
  authenticateLocal(username: string, pass: string): { success: boolean; user?: User; message?: string } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanUser === 'admin' && cleanPass === 'admin123') {
      const user: User = {
        id: 'usr-admin-1',
        username: 'admin',
        role: 'admin',
        name: 'Administrator Tangki',
        token: 'local-admin-token-' + Date.now(),
      };
      this.setCurrentUser(user);
      return { success: true, user };
    }

    if (cleanUser === 'viewer' && cleanPass === 'viewer123') {
      const user: User = {
        id: 'usr-viewer-1',
        username: 'viewer',
        role: 'viewer',
        name: 'Viewer / Pemilik Usaha',
        token: 'local-viewer-token-' + Date.now(),
      };
      this.setCurrentUser(user);
      return { success: true, user };
    }

    return {
      success: false,
      message: 'Username atau password salah. Coba: admin/admin123 atau viewer/viewer123',
    };
  },
};
