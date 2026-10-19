import { Category, Transaction, User, BusinessProfile } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from '../utils/defaultData';

const STORAGE_TRANSACTIONS = 'tangki_air_transactions_v1';
const STORAGE_CATEGORIES = 'tangki_air_categories_v1';
const STORAGE_CONFIG = 'tangki_air_gas_config_v1';
const STORAGE_BUSINESS_PROFILE = 'tangki_air_business_profile_v1';

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  appName: 'TIRTA KEUANGAN',
  businessName: 'CV. Tirta Lancar Abadi (Tangki Air)',
  address: 'Jl. Raya Sumber Mata Air No. 45, Bogor',
  trucks: 'B 9182 TGA (8.000 L), B 9234 TAB (5.000 L), B 9801 XYZ (16.000 L)',
  phone: '0812-3456-7890',
};

export interface GasApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  transactions?: Transaction[];
  categories?: Category[];
  transaction?: Transaction;
  category?: Category;
  user?: User;
  data?: T;
  spreadsheetTitle?: string;
}

// Default URL dari environment variable (Vite / Vercel build: VITE_APPS_SCRIPT_URL)
export const PROJECT_DEFAULT_APPS_SCRIPT_URL =
  ((import.meta as unknown as { env: Record<string, string> }).env?.VITE_APPS_SCRIPT_URL || '').trim();

export class AppApiService {
  /**
   * Mengambil URL Google Apps Script yang aktif.
   * Prioritas:
   * 1. Jika ada URL kustom yang VALID di localStorage (diawali https://script.google.com/macros/s/), gunakan.
   * 2. Jika di localStorage kosong/rusak/tidak valid, WAJIB menggunakan PROJECT_DEFAULT_APPS_SCRIPT_URL.
   * 3. LocalStorage kosong TIDAK PERNAH menimpa konfigurasi default proyek!
   */
  public static getAppsScriptUrl(): string {
    const rawStorage = localStorage.getItem(STORAGE_CONFIG);
    if (rawStorage) {
      try {
        const parsed = JSON.parse(rawStorage);
        const storedUrl = typeof parsed?.appsScriptUrl === 'string' ? parsed.appsScriptUrl.trim() : '';
        if (storedUrl.startsWith('https://script.google.com/macros/s/')) {
          return storedUrl;
        }
      } catch {
        // Abaikan parse error, gunakan default proyek
      }
    }
    return PROJECT_DEFAULT_APPS_SCRIPT_URL;
  }

  /**
   * Cek apakah aplikasi sudah memiliki konfigurasi URL Apps Script yang valid
   */
  public static isConfigured(): boolean {
    const url = this.getAppsScriptUrl();
    return !!url && url.startsWith('https://script.google.com/macros/s/');
  }

  /**
   * Menyimpan URL baru ke localStorage.
   * Jika url kosong, hapus dari localStorage agar kembali ke PROJECT_DEFAULT_APPS_SCRIPT_URL.
   */
  public static setAppsScriptUrl(url: string): void {
    const trimmed = url.trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_CONFIG);
      return;
    }
    const config = {
      appsScriptUrl: trimmed,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
  }

  // --- LOCAL PERSISTENCE HELPERS ---
  public static getLocalTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  public static setLocalTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(transactions));
  }

  public static getLocalCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public static setLocalCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(categories));
  }

  public static getBusinessProfile(): BusinessProfile {
    try {
      const data = localStorage.getItem(STORAGE_BUSINESS_PROFILE);
      if (!data) return DEFAULT_BUSINESS_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_BUSINESS_PROFILE,
        ...parsed,
        appName: parsed.appName?.trim() || DEFAULT_BUSINESS_PROFILE.appName,
      };
    } catch {
      return DEFAULT_BUSINESS_PROFILE;
    }
  }

  public static setBusinessProfile(
    profile: BusinessProfile,
    currentUser?: User | null
  ): { success: boolean; message: string } {
    if (currentUser && currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Admin yang dapat memperbarui pengaturan profil usaha.',
      };
    }
    try {
      localStorage.setItem(STORAGE_BUSINESS_PROFILE, JSON.stringify(profile));
      return {
        success: true,
        message: 'Pengaturan profil usaha dan nama aplikasi berhasil disimpan!',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Gagal menyimpan profil: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  }

  /**
   * Test connection to Google Apps Script Web App
   */
  public static async testConnection(customUrl?: string): Promise<{ success: boolean; message: string; title?: string }> {
    const url = customUrl !== undefined ? customUrl.trim() : this.getAppsScriptUrl();
    if (!url) {
      return {
        success: false,
        message: 'URL Google Apps Script belum diisi. Masukkan URL Web App (akhiran /exec) terlebih dahulu.',
      };
    }

    if (!url.startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'Format URL salah! URL harus diawali dengan https://script.google.com/macros/s/.../exec',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      // Testing via GET action=testConnection
      const testEndpoint = `${url}${url.includes('?') ? '&' : '?'}action=testConnection`;
      const response = await fetch(testEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `Server merespons status HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const json = await response.json() as GasApiResponse;
      if (json.success) {
        return {
          success: true,
          message: json.message || 'Koneksi ke Google Spreadsheet berhasil!',
          title: json.spreadsheetTitle,
        };
      } else {
        return {
          success: false,
          message: json.message || 'Apps Script merespons error.',
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('abort')) {
        return {
          success: false,
          message: 'Koneksi timeout (lebih dari 12 detik). Pastikan deployment Apps Script disetel ke "Anyone" (Siapa saja).',
        };
      }
      return {
        success: false,
        message: `Gagal menghubungi Apps Script: ${errorMsg}. Pastikan izin deployment adalah "Anyone / Siapa saja".`,
      };
    }
  }

  /**
   * Mengambil data transaksi dan kategori dari Google Apps Script atau Local fallback
   */
  public static async fetchAllData(): Promise<{
    transactions: Transaction[];
    categories: Category[];
    fromSpreadsheet: boolean;
    error?: string;
  }> {
    const url = this.getAppsScriptUrl();
    const localTrx = this.getLocalTransactions();
    const localCats = this.getLocalCategories();

    if (!url) {
      return {
        transactions: localTrx,
        categories: localCats,
        fromSpreadsheet: false,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const endpoint = `${url}${url.includes('?') ? '&' : '?'}action=getInitialData`;
      const res = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = (await res.json()) as GasApiResponse;
        if (json.success && Array.isArray(json.transactions)) {
          // Update local cache
          this.setLocalTransactions(json.transactions);
          if (Array.isArray(json.categories) && json.categories.length > 0) {
            this.setLocalCategories(json.categories);
          }
          return {
            transactions: json.transactions,
            categories: json.categories || localCats,
            fromSpreadsheet: true,
          };
        }
      }

      return {
        transactions: localTrx,
        categories: localCats,
        fromSpreadsheet: false,
        error: 'Respons Spreadsheet tidak sesuai, menggunakan data lokal.',
      };
    } catch (err: unknown) {
      console.warn('Apps Script sync fetch error:', err);
      return {
        transactions: localTrx,
        categories: localCats,
        fromSpreadsheet: false,
        error: 'Koneksi Google Spreadsheet sedang offline, menggunakan data lokal tersimpan.',
      };
    }
  }

  /**
   * Menambah Transaksi baru (Dilindungi hak akses: Hanya Admin)
   */
  public static async addTransaction(
    trx: Omit<Transaction, 'id' | 'createdAt'>,
    user: User
  ): Promise<{ success: boolean; transaction?: Transaction; message?: string }> {
    // 1. Otorisasi Frontend & Backend Check
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'AKSES DITOLAK: Anda adalah akun Viewer. Hanya Admin yang memiliki hak menambah transaksi.',
      };
    }

    const newTransaction: Transaction = {
      ...trx,
      id: 'TRX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
      createdBy: user.username,
      syncedToSheets: false,
    };

    // Update local first
    const list = this.getLocalTransactions();
    const updatedList = [newTransaction, ...list];
    this.setLocalTransactions(updatedList);

    // Kirim ke Google Apps Script jika URL ada
    const url = this.getAppsScriptUrl();
    if (url) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'addTransaction',
            transaction: newTransaction,
            userRole: user.role,
            user: { username: user.username, role: user.role },
            token: user.token,
          }),
        });

        const json = await response.json();
        if (json.success) {
          newTransaction.syncedToSheets = true;
          this.setLocalTransactions(
            this.getLocalTransactions().map((t) => (t.id === newTransaction.id ? { ...t, syncedToSheets: true } : t))
          );
        } else {
          return {
            success: true,
            transaction: newTransaction,
            message: `Tersimpan di perangkat lokal. Catatan Apps Script: ${json.message}`,
          };
        }
      } catch (err) {
        console.warn('Gagal sync ke Spreadsheet:', err);
        return {
          success: true,
          transaction: newTransaction,
          message: 'Tersimpan di penyimpanan lokal (koneksi Spreadsheet sedang lambat atau offline).',
        };
      }
    }

    return {
      success: true,
      transaction: newTransaction,
      message: 'Transaksi berhasil disimpan!',
    };
  }

  /**
   * Mengedit Transaksi (Dilindungi hak akses: Hanya Admin)
   */
  public static async editTransaction(
    trx: Transaction,
    user: User
  ): Promise<{ success: boolean; transaction?: Transaction; message?: string }> {
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'AKSES DITOLAK: Hanya Admin yang dapat mengedit transaksi.',
      };
    }

    const updatedTrx = {
      ...trx,
      updatedAt: new Date().toISOString(),
    };

    const list = this.getLocalTransactions();
    const updatedList = list.map((item) => (item.id === trx.id ? updatedTrx : item));
    this.setLocalTransactions(updatedList);

    const url = this.getAppsScriptUrl();
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'editTransaction',
            transaction: updatedTrx,
            userRole: user.role,
            user: { username: user.username, role: user.role },
            token: user.token,
          }),
        });
      } catch (err) {
        console.warn('Gagal update ke Google Apps Script:', err);
      }
    }

    return {
      success: true,
      transaction: updatedTrx,
      message: 'Perubahan transaksi berhasil disimpan!',
    };
  }

  /**
   * Menghapus Transaksi (Dilindungi hak akses: Hanya Admin)
   */
  public static async deleteTransaction(
    trxId: string,
    user: User
  ): Promise<{ success: boolean; message?: string }> {
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'AKSES DITOLAK: Hanya Admin yang berhak menghapus transaksi.',
      };
    }

    const list = this.getLocalTransactions();
    const filtered = list.filter((item) => item.id !== trxId);
    this.setLocalTransactions(filtered);

    const url = this.getAppsScriptUrl();
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deleteTransaction',
            transactionId: trxId,
            userRole: user.role,
            user: { username: user.username, role: user.role },
            token: user.token,
          }),
        });
      } catch (err) {
        console.warn('Gagal menghapus dari Spreadsheet:', err);
      }
    }

    return {
      success: true,
      message: 'Transaksi berhasil dihapus!',
    };
  }

  /**
   * Menambah Kategori Baru (Admin Only)
   */
  public static async addCategory(
    category: Omit<Category, 'id'>,
    user: User
  ): Promise<{ success: boolean; category?: Category; message?: string }> {
    if (user.role !== 'admin') {
      return { success: false, message: 'Hanya Admin yang dapat menambah kategori.' };
    }

    const newCat: Category = {
      ...category,
      id: 'CAT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      isSystem: false,
    };

    const categories = this.getLocalCategories();
    // Cek duplikasi nama
    if (categories.some((c) => c.name.toLowerCase() === newCat.name.toLowerCase() && c.type === newCat.type)) {
      return { success: false, message: `Kategori "${newCat.name}" sudah ada!` };
    }

    const updated = [...categories, newCat];
    this.setLocalCategories(updated);

    const url = this.getAppsScriptUrl();
    if (url) {
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'addCategory',
            category: newCat,
            userRole: user.role,
            user: { username: user.username, role: user.role },
            token: user.token,
          }),
        });
      } catch (err) {
        console.warn('Gagal sync category ke Sheets:', err);
      }
    }

    return { success: true, category: newCat, message: 'Kategori baru berhasil ditambahkan!' };
  }

  /**
   * Menghapus Kategori (Admin Only)
   */
  public static async deleteCategory(
    catId: string,
    user: User
  ): Promise<{ success: boolean; message?: string }> {
    if (user.role !== 'admin') {
      return { success: false, message: 'Hanya Admin yang dapat menghapus kategori.' };
    }

    const categories = this.getLocalCategories();
    const target = categories.find((c) => c.id === catId);
    if (!target) {
      return { success: false, message: 'Kategori tidak ditemukan' };
    }
    if (target.isSystem) {
      return { success: false, message: 'Kategori sistem tidak dapat dihapus!' };
    }

    const updated = categories.filter((c) => c.id !== catId);
    this.setLocalCategories(updated);

    const url = this.getAppsScriptUrl();
    if (url) {
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deleteCategory',
            categoryId: catId,
            userRole: user.role,
            user: { username: user.username, role: user.role },
            token: user.token,
          }),
        });
      } catch (err) {
        console.warn('Gagal delete category di Sheets:', err);
      }
    }

    return { success: true, message: 'Kategori berhasil dihapus' };
  }

  /**
   * Sinkronisasi seluruh data lokal ke Google Spreadsheet
   */
  public static async syncAllToSpreadsheet(user: User): Promise<{ success: boolean; message: string }> {
    if (user.role !== 'admin') {
      return { success: false, message: 'Hanya Admin yang berhak melakukan sinkronisasi data ke Google Spreadsheet.' };
    }

    const url = this.getAppsScriptUrl();
    if (!url) {
      return { success: false, message: 'URL Google Apps Script belum diatur di menu Pengaturan.' };
    }

    const transactions = this.getLocalTransactions();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncAll',
          transactions: transactions,
          userRole: user.role,
          user: { username: user.username, role: user.role },
          token: user.token,
        }),
      });

      const json = await response.json();
      if (json.success) {
        const marked = transactions.map((t) => ({ ...t, syncedToSheets: true }));
        this.setLocalTransactions(marked);
        return { success: true, message: json.message || 'Sinkronisasi berhasil!' };
      } else {
        return { success: false, message: json.message || 'Gagal sinkronisasi ke Spreadsheet.' };
      }
    } catch (err) {
      return {
        success: false,
        message: 'Gagal mengirim data ke Google Spreadsheet: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  }
}
