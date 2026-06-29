/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sale } from '../types';
import { CircleDollarSign, CheckCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EncaissementsProps {
  ventes: Sale[];
  onUpdateSaleStatus: (saleId: number, status: 'Payé', modePaiement: string) => void;
  primaryColor: string;
}

export default function Encaissements({ ventes = [], onUpdateSaleStatus, primaryColor }: EncaissementsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleForCashIn, setSelectedSaleForCashIn] = useState<Sale | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('MTN MoMo');

  // Format price helper
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  // Filter for pending ("En attente") sales
  const pendingSales = ventes.filter(v => v.statut === 'En attente');
  
  // Apply search on top of pending sales
  const filteredPending = pendingSales.filter(v =>
    v.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paid sales for history
  const completedEncaissements = ventes.filter(v => v.statut === 'Payé');

  const handleCashInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForCashIn) return;

    onUpdateSaleStatus(selectedSaleForCashIn.id, 'Payé', paymentMode);
    alert(`Encaissement validé pour la vente ${selectedSaleForCashIn.reference} !`);
    setSelectedSaleForCashIn(null);
  };

  return (
    <div id="encaissements-module" className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-black italic text-sm text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <CircleDollarSign size={18} style={{ color: primaryColor }} />
            Suivi des Encaissements & Créances
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Suivez et encaissez les ventes en attente de règlement</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-100">
            Créances : <span className="font-black text-amber-700">{pendingSales.length} en attente</span>
          </div>
          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-100">
            Total Encaissé : <span className="font-black text-emerald-700">{completedEncaissements.length} payées</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Outstanding receivables list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Créances en attente ({filteredPending.length})</span>
            
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Rechercher client, réf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg outline-none text-xs font-semibold focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredPending.length > 0 ? (
              filteredPending.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedSaleForCashIn(v)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    selectedSaleForCashIn?.id === v.id
                      ? 'border-2 bg-amber-50/20 border-amber-500 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-700 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        {v.reference}
                      </span>
                      <h4 className="font-black text-slate-800 text-xs">{v.client}</h4>
                    </div>
                    <p className="text-slate-500 font-bold text-[11px] line-clamp-1">{v.nom} <span className="text-slate-400 font-normal">(x{v.qte})</span></p>
                    <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock size={10} className="text-amber-500" />
                      Enregistré le {v.date}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="font-black text-slate-800 text-xs">{formatXOF(v.total)}</span>
                    <span className="bg-amber-100 text-amber-700 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                      En attente
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <CheckCircle className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs font-bold text-slate-500">Excellente nouvelle !</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Aucun règlement n'est actuellement en attente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cash in action pane */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedSaleForCashIn ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-black italic text-xs text-slate-800 uppercase tracking-tight">Procéder à l'Encaissement</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Enregistrement de paiement</p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Client:</span>
                    <span className="font-black text-slate-800">{selectedSaleForCashIn.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Référence:</span>
                    <span className="font-mono font-bold text-amber-700">{selectedSaleForCashIn.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Article:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{selectedSaleForCashIn.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Date de vente:</span>
                    <span className="font-medium text-slate-600">{selectedSaleForCashIn.date}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-black text-slate-800">MONTANT DU :</span>
                    <span className="font-black text-amber-600">{formatXOF(selectedSaleForCashIn.total)}</span>
                  </div>
                </div>

                <form onSubmit={handleCashInSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Moyen de paiement encaissé *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:bg-white"
                    >
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="Moov Flooz">Moov Flooz</option>
                      <option value="Espèces">Espèces</option>
                      <option value="Virement Bank">Virement Bank</option>
                      <option value="Chèque">Chèque</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: primaryColor }}
                    className="w-full text-white font-black py-3.5 rounded-xl uppercase shadow-sm tracking-wider text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={14} />
                    <span>Encaisser et Clôturer</span>
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-6 border border-dashed border-slate-200 text-center text-xs text-slate-400 font-semibold py-12">
                <CircleDollarSign className="mx-auto text-slate-300 mb-2" size={32} />
                <p>Sélectionnez une créance à gauche pour enregistrer son encaissement en caisse.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
