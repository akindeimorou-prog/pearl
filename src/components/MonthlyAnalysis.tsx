/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale } from '../types';
import { Calendar, TrendingUp, Sparkles, CheckSquare, Coins } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';

interface MonthlyAnalysisProps {
  produits: Product[];
  ventes: Sale[];
  primaryColor: string;
}

export default function MonthlyAnalysis({ produits = [], ventes = [], primaryColor }: MonthlyAnalysisProps) {
  // Format price helper
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const getMonthYearStr = (dateStr: string) => {
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
        monthYearStr: `${monthNames[monthIndex]} ${year}`,
        monthKey: `${year}-${parts[1]}` // for sorting
      };
    }
    return { monthName: "En cours", year: "", monthYearStr: "Mois Actuel", monthKey: "9999-99" };
  };

  // Group sales by MonthKey
  const monthlyDataMap: {
    [key: string]: {
      monthYearStr: string;
      revenue: number;
      cost: number;
      profit: number;
      qty: number;
      paidCount: number;
      unpaidCount: number;
    }
  } = {};

  ventes.forEach(v => {
    const { monthYearStr, monthKey } = getMonthYearStr(v.date);
    
    const originalProd = produits.find(p => p.nom === v.nom);
    const unitCost = originalProd ? originalProd.pr : v.pv * 0.5;
    const costTotalForSale = unitCost * v.qte;

    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = {
        monthYearStr,
        revenue: 0,
        cost: 0,
        profit: 0,
        qty: 0,
        paidCount: 0,
        unpaidCount: 0
      };
    }

    monthlyDataMap[monthKey].revenue += v.total;
    monthlyDataMap[monthKey].cost += costTotalForSale;
    monthlyDataMap[monthKey].profit += (v.total - costTotalForSale);
    monthlyDataMap[monthKey].qty += v.qte;
    
    if (v.statut === 'Payé') {
      monthlyDataMap[monthKey].paidCount += 1;
    } else {
      monthlyDataMap[monthKey].unpaidCount += 1;
    }
  });

  // Convert map to sorted array
  const sortedMonthlyAnalysis = Object.keys(monthlyDataMap)
    .sort() // chronological order
    .map(key => {
      const item = monthlyDataMap[key];
      return {
        key,
        monthYearStr: item.monthYearStr,
        Revenu: item.revenue,
        Bénéfice: item.profit,
        cost: item.cost,
        qty: item.qty,
        paidCount: item.paidCount,
        unpaidCount: item.unpaidCount,
        marginPct: item.revenue > 0 ? Math.round((item.profit / item.revenue) * 100) : 0
      };
    });

  // Best month by revenue
  const bestMonthByRevenue = [...sortedMonthlyAnalysis].sort((a, b) => b.Revenu - a.Revenu)[0];

  return (
    <div id="monthly-analysis-module" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Monthly Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <h3 className="font-black italic text-xs text-slate-800 uppercase tracking-tight">Courbe de Progression Mensuelle</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Évolution des Revenus vs Bénéfices nets (FCFA)</p>
            </div>

            <div className="h-[280px] w-full">
              {sortedMonthlyAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sortedMonthlyAnalysis}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBenefice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="monthYearStr" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip
                      formatter={(value: any) => [formatXOF(value), '']}
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="Revenu" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenu)" />
                    <Area type="monotone" dataKey="Bénéfice" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBenefice)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                  Aucune donnée mensuelle disponible pour afficher le graphique
                </div>
              )}
            </div>
          </div>

          {bestMonthByRevenue && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block">Mois Record d'Activité</span>
                  <h4 className="font-black text-slate-800 text-sm">{bestMonthByRevenue.monthYearStr}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Le mois le plus performant en termes de chiffre d'affaires.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-800 text-sm block">{formatXOF(bestMonthByRevenue.Revenu)}</span>
                <span className="text-[10px] text-slate-400 font-bold block">Chiffre d'Affaires</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Monthly list breakdown (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <h3 className="font-black italic text-xs text-slate-800 uppercase tracking-tight">Clôtures Mensuelles</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Résumés par période commerciale</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {[...sortedMonthlyAnalysis].reverse().map((item) => (
                <div key={item.key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                    <span className="font-black text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Calendar size={11} style={{ color: primaryColor }} />
                      {item.monthYearStr}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-white border border-emerald-100 px-1.5 py-0.2 rounded">
                      {item.marginPct}% Marges
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
                    <div>
                      <span>Articles:</span>
                      <span className="text-slate-700 block text-[11px] font-black">x{item.qty} vendus</span>
                    </div>
                    <div>
                      <span>Réglés/Créances:</span>
                      <span className="text-slate-700 block text-[11px] font-black">
                        {item.paidCount} payés / {item.unpaidCount} en attente
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold">Chiffre d'Affaires :</span>
                      <span className="block font-black text-slate-700">{formatXOF(item.Revenu)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-bold">Bénéfice Net :</span>
                      <span className="block font-black text-emerald-600">+{formatXOF(item.Bénéfice)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {sortedMonthlyAnalysis.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs font-semibold">Aucun historique disponible.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
