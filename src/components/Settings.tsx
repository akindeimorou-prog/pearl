/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopConfig, FirebaseCredentials, SyncState } from '../types';
import { Palette, Cloud, Database, RefreshCw, RotateCcw, Info, Settings2, ShieldCheck } from 'lucide-react';
import { getStoredFirebaseConfig, saveStoredFirebaseConfig, resetFirebaseConfig, DEFAULT_FIREBASE_CONFIG } from '../services/firebase';
import { motion } from 'motion/react';

interface SettingsProps {
  config: ShopConfig;
  onUpdateConfig: (config: ShopConfig) => void;
  syncState: SyncState;
  syncError: string | null;
  onReconnectFirebase: () => void;
  primaryColor: string;
}

const COLOR_PRESETS = [
  { name: 'Or Pearl (Défaut)', hex: '#B8973A' },
  { name: 'Émeraude Royale', hex: '#059669' },
  { name: 'Saphir Profond', hex: '#2563eb' },
  { name: 'Rubis Intense', hex: '#e11d48' },
  { name: 'Charbon Sombre', hex: '#1e293b' },
];

export default function Settings({
  config,
  onUpdateConfig,
  syncState,
  syncError,
  onReconnectFirebase,
  primaryColor
}: SettingsProps) {
  // Brand settings state
  const [brandName, setBrandName] = useState(config.brand);
  const [brandLogo, setBrandLogo] = useState(config.logo);
  const [customColor, setCustomColor] = useState(config.primary);

  // Firebase config state
  const [fbConfig, setFbConfig] = useState<FirebaseCredentials>(getStoredFirebaseConfig());
  const [showAdvancedFb, setShowAdvancedFb] = useState(false);
  const [isSavedFbMsg, setIsSavedFbMsg] = useState(false);

  const handleSaveConfig = () => {
    onUpdateConfig({
      brand: brandName,
      logo: brandLogo,
      primary: customColor,
      dark: config.dark,
    });
    alert("Paramètres de la boutique sauvegardés !");
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredFirebaseConfig(fbConfig);
    setIsSavedFbMsg(true);
    onReconnectFirebase();
    setTimeout(() => {
      setIsSavedFbMsg(false);
    }, 4000);
  };

  const handleResetFirebase = () => {
    if (window.confirm("Voulez-vous vraiment restaurer la base de données de synchronisation par défaut ?")) {
      resetFirebaseConfig();
      setFbConfig(DEFAULT_FIREBASE_CONFIG);
      onReconnectFirebase();
      alert("Base de données par défaut restaurée !");
    }
  };

  return (
    <div id="settings-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand & Theme panel */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-2 bg-slate-50 text-slate-700 rounded-xl">
            <Palette size={18} style={{ color: primaryColor }} />
          </div>
          <h3 className="font-black italic text-sm text-slate-800 uppercase tracking-tight">Identité de la Boutique</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nom de l'enseigne</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-bold outline-none focus:bg-white focus:border-amber-200"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lien URL du logo (Image)</label>
            <input
              type="text"
              value={brandLogo}
              onChange={(e) => setBrandLogo(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-amber-200"
            />
            <p className="text-[9px] text-slate-400 mt-1 italic">
              Vous pouvez entrer un lien direct d'image (ex: Unsplash, Imgur, ou votre site).
            </p>
          </div>

          {/* Color chooser */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Couleur principale du thème</label>
            
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer shadow-inner shrink-0"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  onClick={() => setCustomColor(p.hex)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                    customColor.toLowerCase() === p.hex.toLowerCase()
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full block border border-black/10" style={{ backgroundColor: p.hex }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            style={{ backgroundColor: primaryColor }}
            className="w-full text-white p-4 rounded-xl font-black uppercase text-xs shadow-md active:scale-95 transition-all mt-4"
          >
            Sauvegarder l'identité
          </button>
        </div>
      </div>

      {/* Cloud Sync panel */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-50 text-slate-700 rounded-xl">
              <Cloud size={18} style={{ color: primaryColor }} />
            </div>
            <h3 className="font-black italic text-sm text-slate-800 uppercase tracking-tight">Synchronisation Cloud</h3>
          </div>

          {/* Sync Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              syncState === 'synced'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : syncState === 'connecting'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                  : syncState === 'offline'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full block ${
                syncState === 'synced'
                  ? 'bg-emerald-500'
                  : syncState === 'connecting'
                    ? 'bg-blue-500'
                    : syncState === 'offline'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
              }`}
            />
            {syncState === 'synced'
              ? 'Connecté (Live)'
              : syncState === 'connecting'
                ? 'Recherche...'
                : syncState === 'offline'
                  ? 'Local Seul'
                  : 'Erreur de Synchro'}
          </span>
        </div>

        {/* Sync Info Banner */}
        <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Technologie :</span>
            <span className="font-black text-slate-700">Firebase Realtime DB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Branchement :</span>
            <span className="font-bold text-amber-600 truncate max-w-[200px]" title={fbConfig.databaseURL}>
              {fbConfig.databaseURL || 'Aucun'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Chemin Cloud :</span>
            <span className="font-mono text-slate-600">/pearl_benin_data</span>
          </div>

          {syncError && (
            <div className="text-rose-600 font-bold text-[11px] pt-1 border-t border-rose-100 flex gap-1 items-start mt-2">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>{syncError}</span>
            </div>
          )}
        </div>

        {/* Sync Action controls */}
        <div className="flex gap-2">
          <button
            onClick={onReconnectFirebase}
            className="flex-1 py-3 px-4 border border-slate-100 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-slate-700 active:scale-95"
          >
            <RefreshCw size={13} className={syncState === 'connecting' ? 'animate-spin text-amber-600' : ''} />
            Forcer la reconnexion
          </button>

          <button
            onClick={handleResetFirebase}
            className="py-3 px-4 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
            title="Restaurer la base d'origine"
          >
            <RotateCcw size={13} />
            Restaurer l'origine
          </button>
        </div>

        {/* Expandable Firebase Configuration details */}
        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={() => setShowAdvancedFb(!showAdvancedFb)}
            className="w-full flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider hover:text-slate-700"
          >
            <span>{showAdvancedFb ? 'Masquer' : 'Afficher'} les paramètres avancés Firebase</span>
            <span>{showAdvancedFb ? '▲' : '▼'}</span>
          </button>

          {showAdvancedFb && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleSaveFirebase}
              className="space-y-3 mt-4"
            >
              <div className="bg-amber-50 p-3 rounded-xl text-[10px] text-amber-800 leading-relaxed border border-amber-100 flex gap-2">
                <Info size={14} className="shrink-0 text-amber-600 mt-0.5" />
                <p>
                  Pour connecter votre propre application et sauvegarder vos données de vente en toute indépendance, créez un projet sur la console Firebase, activez <strong>Realtime Database</strong> en mode lecture/écriture publique, et copiez vos informations ci-dessous.
                </p>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block">Database URL *</label>
                <input
                  type="text"
                  value={fbConfig.databaseURL}
                  onChange={(e) => setFbConfig({ ...fbConfig, databaseURL: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block">API Key</label>
                  <input
                    type="text"
                    value={fbConfig.apiKey}
                    onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block">Project ID</label>
                  <input
                    type="text"
                    value={fbConfig.projectId}
                    onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block">App ID</label>
                  <input
                    type="text"
                    value={fbConfig.appId}
                    onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block">Auth Domain</label>
                  <input
                    type="text"
                    value={fbConfig.authDomain}
                    onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 text-white p-3 rounded-xl font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-1"
                >
                  <ShieldCheck size={14} />
                  Appliquer les Clés
                </button>
              </div>

              {isSavedFbMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-600 font-bold text-center mt-2"
                >
                  ✓ Clés enregistrées en local ! Tentative de connexion...
                </motion.p>
              )}
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
