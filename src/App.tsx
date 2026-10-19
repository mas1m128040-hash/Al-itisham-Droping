import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { SpreadsheetModal } from './components/SpreadsheetModal';
import { GuideModal } from './components/GuideModal';
import { InstallModal } from './components/InstallModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AppApiService } from './services/api';
import { AuthService } from './services/authService';
import { Transaction, Category, User, ActivePage, BusinessProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getCurrentUser());
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() =>
    AppApiService.getBusinessProfile()
  );
  const [isSheetsConnected, setIsSheetsConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync document title with business profile appName
  useEffect(() => {
    if (businessProfile.appName) {
      document.title = `${businessProfile.appName} - Manajemen Keuangan Tangki Air`;
    }
  }, [businessProfile.appName]);

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await AppApiService.fetchAllData();
      setTransactions(result.transactions);
      setCategories(result.categories);
      setIsSheetsConnected(result.fromSpreadsheet);
      if (result.error && !result.fromSpreadsheet && AppApiService.getAppsScriptUrl()) {
        showToast(result.error);
      }
    } catch {
      // Local fallback
      setTransactions(AppApiService.getLocalTransactions());
      setCategories(AppApiService.getLocalCategories());
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Selamat datang, ${user.name}!`);
    loadData();
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    showToast('Anda telah keluar dari aplikasi.');
  };

  // Transaction CRUD
  const handleSaveTransaction = async (
    trx: Omit<Transaction, 'id' | 'createdAt'> | Transaction
  ) => {
    if (!currentUser) return;

    if ('id' in trx) {
      // Edit
      const res = await AppApiService.editTransaction(trx as Transaction, currentUser);
      if (res.success) {
        setTransactions((prev) =>
          prev.map((item) => (item.id === trx.id ? (res.transaction || (trx as Transaction)) : item))
        );
        showToast('Transaksi berhasil diperbarui!');
      } else {
        alert(res.message);
      }
    } else {
      // Add
      const res = await AppApiService.addTransaction(trx, currentUser);
      if (res.success && res.transaction) {
        setTransactions((prev) => [res.transaction!, ...prev]);
        showToast('Transaksi baru berhasil dicatat!');
      } else {
        alert(res.message);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !currentUser) return;
    setIsDeleting(true);
    try {
      const res = await AppApiService.deleteTransaction(deleteTarget.id, currentUser);
      if (res.success) {
        setTransactions((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast('Transaksi berhasil dihapus.');
        setDeleteTarget(null);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Gagal menghapus: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDeleting(false);
    }
  };

  // Category Handlers
  const handleAddCategory = async (cat: Omit<Category, 'id'>) => {
    if (!currentUser) return;
    const res = await AppApiService.addCategory(cat, currentUser);
    if (res.success && res.category) {
      setCategories((prev) => [...prev, res.category!]);
      showToast('Kategori baru berhasil ditambahkan!');
    } else {
      alert(res.message);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!currentUser) return;
    const res = await AppApiService.deleteCategory(catId, currentUser);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showToast('Kategori berhasil dihapus.');
    } else {
      alert(res.message);
    }
  };

  // Business Profile Settings Handler
  const handleSaveBusinessProfile = (newProfile: BusinessProfile) => {
    const res = AppApiService.setBusinessProfile(newProfile, currentUser);
    if (res.success) {
      setBusinessProfile(newProfile);
      showToast('Pengaturan nama aplikasi & profil usaha berhasil disimpan!');
    } else {
      alert(res.message);
    }
  };

  // Manual Sync trigger
  const handleSyncNow = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      if (currentUser.role === 'admin') {
        const syncRes = await AppApiService.syncAllToSpreadsheet(currentUser);
        if (syncRes.success) {
          showToast(syncRes.message);
        }
      }
      await loadData();
    } catch (err) {
      showToast('Sinkronisasi gagal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  // If not logged in, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        appName={businessProfile.appName}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Desktop Sidebar & Mobile Drawer (Fixed 240-260px wide, h-screen) */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        appName={businessProfile.appName}
        onOpenAddModal={() => {
          setTransactionToEdit(null);
          setIsAddEditModalOpen(true);
        }}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Right Area: Top Header + Scrollable Page Content Viewport */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar
          currentUser={currentUser}
          appName={businessProfile.appName}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isSheetsConnected={isSheetsConnected}
          onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          isSyncing={isSyncing}
          onSyncNow={handleSyncNow}
          activePage={activePage}
        />

        {/* Scrollable Page Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-6 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto w-full">
            {activePage === 'dashboard' && (
              <DashboardPage
                transactions={transactions}
                currentUser={currentUser}
                onNavigate={setActivePage}
                onOpenAddModal={() => {
                  setTransactionToEdit(null);
                  setIsAddEditModalOpen(true);
                }}
                isSheetsConnected={isSheetsConnected}
              />
            )}

            {activePage === 'transactions' && (
              <TransactionsPage
                transactions={transactions}
                categories={categories}
                currentUser={currentUser}
                onOpenAddModal={() => {
                  setTransactionToEdit(null);
                  setIsAddEditModalOpen(true);
                }}
                onOpenEditModal={(trx) => {
                  setTransactionToEdit(trx);
                  setIsAddEditModalOpen(true);
                }}
                onRequestDelete={(trx) => setDeleteTarget(trx)}
                isSheetsConnected={isSheetsConnected}
              />
            )}

            {activePage === 'reports' && (
              <ReportsPage
                transactions={transactions}
                categories={categories}
                currentUser={currentUser}
                businessProfile={businessProfile}
              />
            )}

            {activePage === 'settings' && (
              <SettingsPage
                currentUser={currentUser}
                categories={categories}
                onOpenAddCategoryModal={() => setIsCategoryModalOpen(true)}
                onDeleteCategory={handleDeleteCategory}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
                onSyncSuccess={loadData}
                isSheetsConnected={isSheetsConnected}
                businessProfile={businessProfile}
                onSaveBusinessProfile={handleSaveBusinessProfile}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activePage={activePage}
        onNavigate={setActivePage}
        currentUser={currentUser}
        onOpenAddModal={() => {
          setTransactionToEdit(null);
          setIsAddEditModalOpen(true);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSubmit={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
        categories={categories}
        currentUser={currentUser}
        trucksList={businessProfile.trucks}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
        currentUser={currentUser}
      />

      <SpreadsheetModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
        currentUser={currentUser}
        onSyncSuccess={loadData}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        appName={businessProfile.appName}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        transaction={deleteTarget}
        isDeleting={isDeleting}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
