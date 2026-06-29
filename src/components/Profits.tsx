/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale } from '../types';
import { DollarSign, Landmark, Percent, TrendingUp, Sparkles, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';

interface ProfitsProps {
  produits: Product[];
  ventes: Sale[];
  primaryColor: string;
}

export default function Profits({ produits = [], ventes = [], primaryColor }: ProfitsProps) {
  // Format price helper
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  // Calculations
  const caTotal = ventes.reduce((sum, v) => sum + v.total, 0);

  // Profit cost calculation
  const coutRevientTotal = ventes.reduce((sum, v) => {
    const originalProd = produits.find(p => p.nom === v.nom);
    const unitCost = originalProd ? originalProd.pr : v.pv * 0.5; // fallback to 50% cost if product not found
    return sum + (unitCost * v.qte);
  }, 0);

  const beneficeNetEstime = Math.max(0, caTotal - coutRevientTotal);
  const margeMoyennePct = caTotal > 0 ? (beneficeNetEstime / caTotal) * 100 : 0;

  // Group by product to list profitability per item
  const productProfitabilityMap: { [key: string]: { qty: number; revenue: number; cost: number; profit: number } } = {};

  ventes.forEach(v => {
    const originalProd = produits.find(p => p.nom === v.nom);
    const unitCost = originalProd ? originalProd.pr : v.pv * 0.5;
    const costTotalForSale = unitCost * v.qte;

    if (!productProfitabilityMap[v.nom]) {
      productProfitabilityMap[v.nom] = { qty: 0, revenue: 0, cost: 0, profit: 0 };
    }

    productProfitabilityMap[v.nom].qty += v.qte;
    productProfitabilityMap[v.nom].revenue += v.total;
    productProfitabilityMap[v.nom].cost += costTotalForSale;
    productProfitabilityMap[v.nom].profit += (v.total - costTotalForSale);
  });

  const profitabilityList = Object.keys(productProfitabilityMap).map(name => {
    const item = productProfitabilityMap[name];
    const marginPct = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
    return {
      name,
      qty: item.qty,
      revenue: item.revenue,
      cost: item.cost,
      profit: item.profit,
      marginPct: Math.round(marginPct * 10) / 10
    };
  }).sort((a, b) => b.profit - a.profit); // Sort by most profitable first

  // Chart data prepare (recharts format)
  const chartData = profitabilityList.map(item => ({
    name: item.name.length > 25 ? item.name.slice(0, 22) + '...' : item.name,
    Bénéfice: item.profit,
    Revenu: item.revenue
  }));

  // Best selling product by profitability
  const bestSellerByProfit = profitabilityList[0];

  return (
    <div id="profits-analysis-module" className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CA Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Chiffre d'Affaires Brut</span>
            <span className="text-xs text-slate-400 font-semibold mt-1 block">Volume de facturation total</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-slate-800 break-all">{formatXOF(caTotal)}</h3>
          </div>
        </div>

        {/* Cost total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Coûts d'Achat Estimés (Revient)</span>
            <span className="text-xs text-slate-400 font-semibold mt-1 block">Valeur de stock écoulé</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-slate-600 break-all">{formatXOF(coutRevientTotal)}</h3>
          </div>
        </div>

        {/* Net estimated profit */}
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/50 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Marge Nette de l'Activité</span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                +{margeMoyennePct.toFixed(1)}% de Marge
              </span>
            </div>
            <span className="text-xs text-slate-400 font-semibold mt-1 block">Bénéfice net commercial</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-emerald-600 break-all">{formatXOF(beneficeNetEstime)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left pane: Recharts margins visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <h3 className="font-black italic text-xs text-slate-800 uppercase tracking-tight">Comparatif Rentabilité par Article</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Bénéfices nets par produit (FCFA)</p>
            </div>

            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${val/1000}k`} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip
                      formatter={(value: any) => [formatXOF(value), '']}
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                    />
                    <Bar dataKey="Bénéfice" fill={primaryColor} radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : primaryColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                  Aucune donnée disponible pour le graphique
                </div>
              )}
            </div>
          </div>

          {/* Star Seller highlights */}
          {bestSellerByProfit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-xs border-b-4"
              style={{ borderBottomColor: primaryColor }}
            >
              <div className="space-y-1">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                  <Award size={12} />
                  Top Rentabilité
                </span>
                <h4 className="font-bold text-sm text-slate-100">{bestSellerByProfit.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Génère à lui seul <strong>{formatXOF(bestSellerByProfit.profit)}</strong> de bénéfice net.
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-xl font-black text-emerald-400">+{bestSellerByProfit.marginPct}%</span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Marge nette</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right pane: list breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <h3 className="font-black italic text-xs text-slate-800 uppercase tracking-tight">Détail des Marges Nets</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Fiche analytique des ventes</p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {profitabilityList.map((item, index) => (
                <div key={item.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 line-clamp-1">
                      {index + 1}. {item.name}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-white border border-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                      {item.marginPct}%
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100/50">
                    <span>Vendus: x{item.qty}</span>
                    <span>Revenu: {formatXOF(item.revenue)}</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Coût total: {formatXOF(item.cost)}</span>
                    <span className="text-slate-700">Profit: <span className="text-emerald-600 font-black">+{formatXOF(item.profit)}</span></span>
                  </div>
                </div>
              ))}

              {profitabilityList.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs font-semibold">Aucune statistique disponible.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
