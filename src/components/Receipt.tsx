/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sale, ShopConfig } from '../types';
import { X, Printer, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptProps {
  sale: Sale | null;
  config: ShopConfig;
  onClose: () => void;
}

export default function Receipt({ sale, config, onClose }: ReceiptProps) {
  if (!sale) return null;

  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="receipt-modal-container" className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border-t-8 border-amber-500 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Invoice Ticket Design */}
        <div className="space-y-6 pt-2">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-200 pb-4">
            {config.logo && (
              <img
                src={config.logo}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl mx-auto object-contain bg-slate-50 p-1 border border-slate-100 mb-2"
              />
            )}
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 italic">{config.brand}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Facture de Vente</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">Réf: {sale.reference}</p>
            <p className="text-[9px] text-slate-400 font-semibold">{sale.date}</p>
          </div>

          {/* Ticket Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Client: {sale.client || "Anonyme"}</span>
            </div>
            
            <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-3">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-slate-800 block leading-tight">{sale.nom}</span>
                <span className="text-slate-400 text-[10px] font-semibold">
                  {sale.qte} x {formatXOF(sale.pv)}
                </span>
              </div>
              <span className="font-black text-slate-800 shrink-0">{formatXOF(sale.total)}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-2 bg-slate-50 rounded-xl px-4">
              <span className="text-xs font-bold text-slate-500">NET À PAYER</span>
              <span className="text-base font-black text-amber-600">{formatXOF(sale.total)}</span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center text-xs px-1">
              <span className="text-slate-400 font-bold">Mode de règlement:</span>
              <span className="font-black text-slate-700">{sale.modePaiement || "Non défini"}</span>
            </div>

            <div className="flex justify-between items-center text-xs px-1">
              <span className="text-slate-400 font-bold">Statut:</span>
              <span 
                className={`inline-flex items-center gap-1 font-black ${
                  sale.statut === 'Payé' ? 'text-emerald-600' : 'text-amber-500'
                }`}
              >
                {sale.statut === 'Payé' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {sale.statut}
              </span>
            </div>

            {/* Receipt Number (Dummy for authenticity) */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pt-2 border-t border-dashed border-slate-200">
              <span>N° DE REÇU :</span>
              <span>PB-{sale.id.toString().slice(-6)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center text-[10px] text-slate-400 italic pt-2 space-y-1">
            <p>Pearl Benin vous remercie de votre confiance !</p>
            <p className="font-bold uppercase tracking-wider text-[8px]">Propulsé par Pearl Benin Sync Pro</p>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            style={{ backgroundColor: config.primary }}
            className="w-full text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={15} />
            Imprimer la Facture
          </button>
        </div>
      </motion.div>
    </div>
  );
}
