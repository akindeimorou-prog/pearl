/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale } from '../types';
import { TrendingUp, AlertTriangle, Coins, ShoppingBag, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsProps {
  produits: Product[];
  ventes: Sale[];
  primaryColor: string;
}

export default function Stats({ produits = [], ventes = [], primaryColor }: StatsProps) {
  // Format price helper
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  // Calculations
  const totalRevenue = ventes.reduce((sum, v) => sum + v.total, 0);

  // Profit calculation: (pv - pr) for sold items
  // We match by name or look up products. Since products might change, we calculate from current matching or fall back.
  const totalCost = ventes.reduce((sum, v) => {
    const originalProd = produits.find(p => p.nom === v.nom);
    const unitCost = originalProd ? originalProd.pr : v.pv * 0.5; // fallback to 50% cost if product not found
    return sum + (unitCost * v.qte);
  }, 0);

  const totalProfit = Math.max(0, totalRevenue - totalCost);
  const totalSalesCount = ventes.reduce((sum, v) => sum + v.qte, 0);
  const lowStockProducts = produits.filter(p => p.stock <= p.seuil);
  const marginPercentage = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return (
    <div id="stats-dashboard" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg md:text-xl font-black text-slate-800 break-all">{formatXOF(totalRevenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Revenu brut total</p>
        </div>
      </motion.div>

      {/* Net profit card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bénéfice Estimé</span>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Coins size={16} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg md:text-xl font-black text-emerald-600 break-all">{formatXOF(totalProfit)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Marge nette estimée</p>
        </div>
      </motion.div>

      {/* Sales Volume */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Articles Vendus</span>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <ShoppingBag size={16} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-black text-slate-800">{totalSalesCount}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Percent size={10} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500">{marginPercentage}% de marge moy.</span>
          </div>
        </div>
      </motion.div>

      {/* Stock alert card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className={`p-5 rounded-2xl shadow-sm border transition-colors flex flex-col justify-between ${
          lowStockProducts.length > 0 
            ? 'bg-rose-50/50 border-rose-100 text-rose-900' 
            : 'bg-white border-slate-100 text-slate-800'
        }`}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertes Stock</span>
          <div className={`p-2 rounded-lg ${lowStockProducts.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className={`text-2xl font-black ${lowStockProducts.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {lowStockProducts.length}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            {lowStockProducts.length > 0 ? 'Articles sous le seuil' : 'Stock en excellente santé'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
