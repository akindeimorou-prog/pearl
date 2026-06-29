/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AppData, Sale, Product, ShopConfig, SyncState } from './types';
import { initializeFirebaseService, pushDataToCloud, DEFAULT_INITIAL_DATA } from './services/firebase';

import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Encaissements from './components/Encaissements';
import Inventory from './components/Inventory';
import Profits from './components/Profits';
import MonthlyAnalysis from './components/MonthlyAnalysis';
import Guide from './components/Guide';
import Settings from './components/Settings';
import Receipt from './components/Receipt';

import {
  LayoutDashboard,
  ShoppingBag,
  CircleDollarSign,
  Package,
  LineChart,
  Calendar,
  BookOpen,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  CloudAlert,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOCAL_STORAGE_KEY = 'pearl_benin_local_data';

export type TabType = 
  | 'dashboard' 
  | 'ventes' 
  | 'encaissements' 
  | 'stocks' 
  | 'profits' 
  | 'monthly' 
  | 'guide' 
  | 'params';

export default function App() {
  // Determine starting data from localStorage or fallback
  const getInitialData = (): AppData => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure initial format compatibility
        if (parsed) {
          return {
            config: parsed.config || DEFAULT_INITIAL_DATA.config,
            produits: Array.isArray(parsed.produits) ? parsed.produits : [],
            ventes: Array.isArray(parsed.ventes) ? parsed.ventes : []
          };
        }
      }
    } catch (e) {
      console.error("Failed to load local data:", e);
    }
    return DEFAULT_INITIAL_DATA;
  };

  const [shopData, setShopData] = useState<AppData>(getInitialData);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Keep track of state transitions to prevent endless cycle
  const updateLocalAndCloud = useCallback(async (newData: AppData) => {
    setShopData(newData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    
    // Only push to cloud if connected or reconnecting
    if (syncState === 'synced' || syncState === 'connecting') {
      const success = await pushDataToCloud(newData);
      if (!success) {
        setSyncState('offline');
      }
    }
  }, [syncState]);

  // Hook up Firebase live listener
  const connectToFirebase = useCallback(() => {
    setSyncState('connecting');
    setSyncError(null);

    initializeFirebaseService(
      (cloudData) => {
        // When cloud returns data, sync it
        if (cloudData) {
          // Double check formatting matches requirements
          const sanitized: AppData = {
            config: cloudData.config || DEFAULT_INITIAL_DATA.config,
            produits: Array.isArray(cloudData.produits) ? cloudData.produits : [],
            ventes: Array.isArray(cloudData.ventes) ? cloudData.ventes : []
          };
          setShopData(sanitized);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
          setSyncState('synced');
        }
      },
      (status, errorMsg) => {
        setSyncState(status);
        if (errorMsg) {
          setSyncError(errorMsg);
        }
        if (status === 'error' || status === 'offline') {
          console.log("Firebase status updated:", status, errorMsg);
        }
      }
    );
  }, []);

  // Initialize on mount
  useEffect(() => {
    connectToFirebase();
  }, [connectToFirebase]);

  // POS sales handler with sequential daily reference number generation
  const handleAddSale = (newSale: Omit<Sale, 'id' | 'date' | 'reference'>) => {
    const saleId = Date.now();
    const today = new Date();
    
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    // Get current year and month for the reference code format PB-YYMMDD-XX
    const yy = String(year).slice(-2);
    const mm = month;
    const dd = day;

    // Filter sales of today to get precise sequence index
    const salesToday = shopData.ventes.filter(v => v.date === dateStr);
    const sequentialIndex = String(salesToday.length + 1).padStart(2, '0');
    const computedReference = `PB-${yy}${mm}${dd}-${sequentialIndex}`;

    const fullSale: Sale = {
      ...newSale,
      id: saleId,
      date: dateStr,
      reference: computedReference
    };

    // Find product index to deduct stock
    const updatedProduits = shopData.produits.map(p => {
      if (p.nom === fullSale.nom) {
        return {
          ...p,
          stock: Math.max(0, p.stock - fullSale.qte)
        };
      }
      return p;
    });

    const updatedVentes = [...shopData.ventes, fullSale];

    const updatedData: AppData = {
      ...shopData,
      produits: updatedProduits,
      ventes: updatedVentes
    };

    updateLocalAndCloud(updatedData);
    
    // Auto open receipt on-screen for printing
    setActiveReceipt(fullSale);
  };

  // Update sale status (Cash-in feature for receivables)
  const handleUpdateSaleStatus = (saleId: number, status: 'Payé', modePaiement: string) => {
    const updatedVentes = shopData.ventes.map(v => {
      if (v.id === saleId) {
        return {
          ...v,
          statut: status,
          modePaiement
        };
      }
      return v;
    });

    const updatedData: AppData = {
      ...shopData,
      ventes: updatedVentes
    };

    updateLocalAndCloud(updatedData);
  };

  // Inventory modifications
  const handleModifyStock = (productId: number, delta: number) => {
    const updatedProduits = shopData.produits.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: Math.max(0, p.stock + delta)
        };
      }
      return p;
    });

    const updatedData: AppData = {
      ...shopData,
      produits: updatedProduits
    };

    updateLocalAndCloud(updatedData);
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const freshProduct: Product = {
      ...newProduct,
      id: Date.now()
    };

    const updatedData: AppData = {
      ...shopData,
      produits: [...shopData.produits, freshProduct]
    };

    updateLocalAndCloud(updatedData);
  };

  const handleDeleteProduct = (productId: number) => {
    const updatedProduits = shopData.produits.filter(p => p.id !== productId);
    
    const updatedData: AppData = {
      ...shopData,
      produits: updatedProduits
    };

    updateLocalAndCloud(updatedData);
  };

  // Brand config changes
  const handleUpdateConfig = (newConfig: ShopConfig) => {
    const updatedData: AppData = {
      ...shopData,
      config: newConfig
    };
    updateLocalAndCloud(updatedData);
  };

  // Helper formats
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const primaryColor = shopData.config.primary || '#B8973A';

  return (
    <div id="main-application-view" className="min-h-screen bg-[#FAF6EE] text-slate-800 antialiased p-3 sm:p-5 md:p-6">
      {/* SCREEN UI */}
      <div className="no-print max-w-6xl mx-auto space-y-5">
        
        {/* TOP BRAND HEADER */}
        <header className="bg-slate-900 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center border-b-4" style={{ borderBottomColor: primaryColor }}>
          <div className="flex items-center gap-3">
            {shopData.config.logo ? (
              <img
                src={shopData.config.logo}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl bg-white p-1 object-contain border"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-white italic">
                PB
              </div>
            )}
            <div className="space-y-0.5">
              <h1 className="font-black text-white text-base uppercase italic tracking-tighter">
                {shopData.config.brand || "Pearl Benin"}
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <span>Pearl Benin Sync Pro</span>
                <span className="text-slate-600">•</span>
                <span style={{ color: primaryColor }}>Gestion & Caisse</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Sync Alert Indicators */}
            <div className="flex items-center">
              {syncState === 'synced' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-full font-bold">
                  <Wifi size={13} />
                  <span className="text-[9px] uppercase tracking-wider font-black">Cloud Sync</span>
                </div>
              )}
              {syncState === 'connecting' && (
                <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/40 border border-blue-900/50 px-3 py-1.5 rounded-full font-bold animate-pulse">
                  <Database size={13} />
                  <span className="text-[9px] uppercase tracking-wider font-black">Connexion...</span>
                </div>
              )}
              {syncState === 'offline' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-950/20 border border-amber-900/20 px-3 py-1.5 rounded-full font-bold" title="Données enregistrées localement">
                  <WifiOff size={13} />
                  <span className="text-[9px] uppercase tracking-wider font-black">Hors-Ligne</span>
                </div>
              )}
              {syncState === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-full font-bold" title={syncError || 'Erreur de base'}>
                  <CloudAlert size={13} />
                  <span className="text-[9px] uppercase tracking-wider font-black">Erreur</span>
                </div>
              )}
            </div>

            {/* Quick config shortcut */}
            <button
              onClick={() => setActiveTab('params')}
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'params' ? 'text-white' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
              style={{ backgroundColor: activeTab === 'params' ? primaryColor : undefined }}
              title="Paramètres de l'enseigne"
            >
              <SettingsIcon size={14} />
            </button>
          </div>
        </header>

        {/* GOOGLE SHEET STYLE NAVIGATION TABS BAR */}
        <div className="bg-[#DFD6C3] p-1 rounded-2xl shadow-inner border border-amber-900/10 overflow-x-auto scrollbar-none flex gap-1">
          {/* Tableau de bord */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <LayoutDashboard size={13} />
            <span>Tableau de Bord</span>
          </button>

          {/* Ventes */}
          <button
            onClick={() => setActiveTab('ventes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'ventes'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <ShoppingBag size={13} />
            <span>Ventes</span>
          </button>

          {/* Encaissements */}
          <button
            onClick={() => setActiveTab('encaissements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'encaissements'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <CircleDollarSign size={13} />
            <span>Encaissements</span>
          </button>

          {/* Stocks */}
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'stocks'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Package size={13} />
            <span>Stocks</span>
          </button>

          {/* Bénéfices */}
          <button
            onClick={() => setActiveTab('profits')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'profits'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <LineChart size={13} />
            <span>Bénéfices</span>
          </button>

          {/* Analyse Mensuelle */}
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'monthly'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Calendar size={13} />
            <span>Analyse Mensuelle</span>
          </button>

          {/* Guide */}
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <BookOpen size={13} />
            <span>Guide</span>
          </button>
        </div>

        {/* ACTIVE TAB MAIN CONTENT */}
        <main className="min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  produits={shopData.produits}
                  ventes={shopData.ventes}
                  onReprint={(sale) => setActiveReceipt(sale)}
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'ventes' && (
                <POS
                  produits={shopData.produits}
                  ventes={shopData.ventes}
                  onAddSale={handleAddSale}
                  onReprint={(sale) => setActiveReceipt(sale)}
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'encaissements' && (
                <Encaissements
                  ventes={shopData.ventes}
                  onUpdateSaleStatus={handleUpdateSaleStatus}
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'stocks' && (
                <Inventory
                  produits={shopData.produits}
                  onAddProduct={handleAddProduct}
                  onModifyStock={handleModifyStock}
                  onDeleteProduct={handleDeleteProduct}
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'profits' && (
                <Profits
                  produits={shopData.produits}
                  ventes={shopData.ventes}
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'monthly' && (
                <MonthlyAnalysis
                  produits={shopData.produits}
                  ventes={shopData.ventes}
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'guide' && (
                <Guide
                  primaryColor={primaryColor}
                />
              )}

              {activeTab === 'params' && (
                <Settings
                  config={shopData.config}
                  onUpdateConfig={handleUpdateConfig}
                  syncState={syncState}
                  syncError={syncError}
                  onReconnectFirebase={connectToFirebase}
                  primaryColor={primaryColor}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* TICKET RECEIPT MODAL */}
        <AnimatePresence>
          {activeReceipt && (
            <Receipt
              sale={activeReceipt}
              config={shopData.config}
              onClose={() => setActiveReceipt(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* PRINT LAYOUT PORTABLE thermal format */}
      {activeReceipt && (
        <div id="invoice-print" className="hidden print:block bg-white p-6 text-slate-900 max-w-xs mx-auto text-xs font-mono">
          <div className="text-center border-b border-dashed border-slate-950 pb-4 mb-4">
            <h1 className="text-base font-black uppercase italic tracking-tight">{shopData.config.brand}</h1>
            <p className="text-[9px] uppercase font-bold tracking-wider">Facture de Vente</p>
            <p className="text-[10px] font-bold mt-1">Réf: {activeReceipt.reference}</p>
            <p className="text-[9px] mt-0.5">{activeReceipt.date}</p>
          </div>
          
          <div className="space-y-2 border-b border-dashed border-slate-950 pb-3 mb-3 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>Client:</span>
              <span>{activeReceipt.client}</span>
            </div>
            <div className="flex justify-between items-start pt-1">
              <span className="font-bold">{activeReceipt.nom}</span>
              <span className="font-black shrink-0 ml-2">{formatXOF(activeReceipt.total)}</span>
            </div>
            <div className="text-[10px] text-slate-500 italic">
              {activeReceipt.qte} x {formatXOF(activeReceipt.pv)}
            </div>
          </div>

          <div className="flex justify-between font-black text-xs py-2 mb-3 bg-slate-100 px-3 rounded">
            <span>NET À PAYER :</span>
            <span>{formatXOF(activeReceipt.total)}</span>
          </div>

          <div className="space-y-1 text-[10px] pb-5 border-b border-dashed border-slate-950 mb-4">
            <div className="flex justify-between">
              <span>Règlement:</span>
              <span className="font-bold">{activeReceipt.modePaiement || "Non défini"}</span>
            </div>
            <div className="flex justify-between">
              <span>Statut:</span>
              <span className="font-bold uppercase">{activeReceipt.statut}</span>
            </div>
          </div>

          <div className="text-center text-[10px] italic space-y-1">
            <p>Pearl Benin vous remercie de votre confiance !</p>
            <p className="uppercase font-bold tracking-wider text-[8px]">Propulsé par Pearl Benin Sync Pro</p>
          </div>
        </div>
      )}
    </div>
  );
}
