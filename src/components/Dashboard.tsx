/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale } from '../types';
import { TrendingUp, CheckCircle, Percent, Calendar, Clock, ShoppingBag, AlertTriangle, Printer } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  produits: Product[];
  ventes: Sale[];
  onReprint: (sale: Sale) => void;
  primaryColor: string;
}

export default function Dashboard({ produits = [], ventes = [], onReprint, primaryColor }: DashboardProps) {
  // Format price helper
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  // Date parsing to identify current month sales
  const getMonthAndYear = (dateStr: string) => {
    // Input format: "DD/MM/YYYY"
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];
      return {
        monthName: monthNames[monthIndex] || "Inconnu",
        year,
        monthYearStr: `${monthNames[monthIndex]} ${year}`
      };
    }
    return { monthName: "En cours", year: "", monthYearStr: "Mois Actuel" };
  };

  // Get current system month details
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentYearStr = today.getFullYear().toString();
  const monthNamesFr = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const activeMonthStr = `${monthNamesFr[currentMonthIndex]} ${currentYearStr}`;

  // Filter sales for the current month
  const currentMonthSales = ventes.filter(v => {
    const info = getMonthAndYear(v.date);
    return info.monthName.toLowerCase() === monthNamesFr[currentMonthIndex].toLowerCase();
  });

  // Calculate metrics
  const caDuMois = currentMonthSales.reduce((sum, v) => sum + v.total, 0);
  
  const encaisse = currentMonthSales
    .filter(v => v.statut === 'Payé')
    .reduce((sum, v) => sum + v.total, 0);

  const enAttente = currentMonthSales
    .filter(v => v.statut === 'En attente')
    .reduce((sum, v) => sum + v.total, 0);

  const articlesVendus = currentMonthSales.reduce((sum, v) => sum + v.qte, 0);

  // Profit & Margin percentage
  const totalCostOfSales = currentMonthSales.reduce((sum, v) => {
    const prod = produits.find(p => p.nom === v.nom);
    const costUnit = prod ? prod.pr : v.pv * 0.5; // fallback to 50%
    return sum + (costUnit * v.qte);
  }, 0);

  const profitMois = caDuMois - totalCostOfSales;
  const margeNettePct = caDuMois > 0 ? (profitMois / caDuMois) * 100 : 0.0;

  const alertesStock = produits.filter(p => p.stock <= p.seuil).length;

  // Last 5 sales
  const last5Sales = [...ventes].reverse().slice(0, 5);

  return (
    <div id="tableau-de-bord-sheet" className="space-y-6">
      {/* SHEET HEADER DESIGN */}
      <div className="bg-[#1A1A1A] text-center py-5 px-6 rounded-2xl border-b-4 border-[#B8973A] shadow-md">
        <h2 className="text-xl sm:text-2xl font-black text-[#B8973A] tracking-wider uppercase italic">
          PEARL BENIN — TABLEAU DE BORD
        </h2>
        <p className="text-[10px] sm:text-xs text-amber-100/70 font-semibold tracking-wide mt-1.5 italic">
          Mode: Racines & Rayonnement • Suivi Commercial & Financier
        </p>
      </div>

      {/* KPI GRID 1 - Row 1 of Google Sheets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CA DU MOIS */}
        <div className="bg-[#FAF6EE] border-2 border-[#B8973A]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-[#B8973A] text-white text-center py-2 px-4 font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5">
            <TrendingUp size={12} />
            <span>CA DU MOIS</span>
          </div>
          <div className="py-6 text-center">
            <span className="text-2xl font-black text-slate-800 italic">{formatXOF(caDuMois)}</span>
          </div>
        </div>

        {/* ENCAISSÉ */}
        <div className="bg-[#FAF6EE] border-2 border-[#B8973A]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-emerald-600 text-white text-center py-2 px-4 font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5">
            <CheckCircle size={12} />
            <span>ENCAISSÉ</span>
          </div>
          <div className="py-6 text-center">
            <span className="text-2xl font-black text-emerald-700 italic">{formatXOF(encaisse)}</span>
          </div>
        </div>

        {/* MARGE NETTE */}
        <div className="bg-[#FAF6EE] border-2 border-[#B8973A]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-800 text-white text-center py-2 px-4 font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5">
            <Percent size={12} />
            <span>MARGE NETTE</span>
          </div>
          <div className="py-6 text-center">
            <span className="text-2xl font-black text-slate-800 italic">{margeNettePct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* KPI GRID 2 - Row 2 of Google Sheets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* MOIS EN COURS */}
        <div className="bg-[#FAF6EE] border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-slate-700 text-slate-200 text-center py-1.5 px-3 font-bold uppercase text-[9px] tracking-wider flex items-center justify-center gap-1">
            <Calendar size={11} />
            <span>MOIS EN COURS</span>
          </div>
          <div className="py-4 text-center">
            <span className="text-base font-black text-slate-700 capitalize">{activeMonthStr}</span>
          </div>
        </div>

        {/* EN ATTENTE PAIEMENT */}
        <div className="bg-[#FAF6EE] border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-amber-500 text-white text-center py-1.5 px-3 font-bold uppercase text-[9px] tracking-wider flex items-center justify-center gap-1">
            <Clock size={11} />
            <span>EN ATTENTE PAIEMENT</span>
          </div>
          <div className="py-4 text-center">
            <span className="text-base font-black text-amber-600">{formatXOF(enAttente)}</span>
          </div>
        </div>

        {/* ARTICLES VENDUS */}
        <div className="bg-[#FAF6EE] border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-slate-800 text-white text-center py-1.5 px-3 font-bold uppercase text-[9px] tracking-wider flex items-center justify-center gap-1">
            <ShoppingBag size={11} />
            <span>ARTICLES VENDUS</span>
          </div>
          <div className="py-4 text-center">
            <span className="text-base font-black text-slate-800">{articlesVendus}</span>
          </div>
        </div>

        {/* ALERTES STOCK */}
        <div className="bg-[#FAF6EE] border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-rose-500 text-white text-center py-1.5 px-3 font-bold uppercase text-[9px] tracking-wider flex items-center justify-center gap-1">
            <AlertTriangle size={11} />
            <span>ALERTES STOCK</span>
          </div>
          <div className="py-4 text-center">
            <span className={`text-base font-black ${alertesStock > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
              {alertesStock}
            </span>
          </div>
        </div>
      </div>

      {/* TABLE SECTION - "DERNIÈRES VENTES (5 PLUS RÉCENTES)" */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Title Banner */}
        <div className="bg-[#1A1A1A] text-white py-3 px-5 font-black text-center text-xs tracking-wider uppercase italic flex items-center justify-center gap-2">
          <span>📋</span>
          <span>DERNIÈRES VENTES (5 PLUS RÉCENTES)</span>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#B8973A]/10 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 font-black">Date</th>
                <th className="py-3 px-4 font-black">Référence</th>
                <th className="py-3 px-4 font-black">Article</th>
                <th className="py-3 px-4 font-black">Client</th>
                <th className="py-3 px-4 text-center font-black">Quantité</th>
                <th className="py-3 px-4 text-right font-black">Prix Unit.</th>
                <th className="py-3 px-4 text-right font-black">Montant</th>
                <th className="py-3 px-4 text-center font-black">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {last5Sales.length > 0 ? (
                last5Sales.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-500">{v.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{v.reference}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 max-w-[200px] truncate">{v.nom}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{v.client || "Client Anonyme"}</td>
                    <td className="py-3 px-4 text-center font-black text-slate-700">{v.qte}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-600">{formatXOF(v.pv)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">{formatXOF(v.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onReprint(v)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        title="Réimprimer le ticket de caisse"
                      >
                        <Printer size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colspan={8} className="py-8 text-center text-slate-400 font-bold">
                    Aucune vente enregistrée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
