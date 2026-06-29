/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Minus, Package, AlertCircle, Search, Sparkles, X, PlusCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryProps {
  produits: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onModifyStock: (id: number, delta: number) => void;
  onDeleteProduct: (id: number) => void;
  primaryColor: string;
}

export default function Inventory({ produits = [], onAddProduct, onModifyStock, onDeleteProduct, primaryColor }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Product state
  const [newNom, setNewNom] = useState('');
  const [newPv, setNewPv] = useState<number | ''>('');
  const [newPr, setNewPr] = useState<number | ''>('');
  const [newStock, setNewStock] = useState<number | ''>('');
  const [newSeuil, setNewSeuil] = useState<number>(2);

  // Helper formats
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const filteredProducts = produits.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = produits.filter(p => p.stock <= p.seuil).length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom || !newPv || !newPr || newStock === '') {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    onAddProduct({
      nom: newNom,
      pv: Number(newPv),
      pr: Number(newPr),
      stock: Number(newStock),
      seuil: Number(newSeuil)
    });

    // Reset Form
    setNewNom('');
    setNewPv('');
    setNewPr('');
    setNewStock('');
    setNewSeuil(2);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: number, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'article "${name}" de l'inventaire ? Cette action est irréversible.`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div id="inventory-container" className="space-y-6">
      {/* Alert stock banner */}
      {lowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-2xl flex items-start gap-3"
        >
          <AlertCircle className="text-rose-600 mt-0.5 shrink-0" size={18} />
          <div>
            <h4 className="font-bold text-rose-800 text-sm">Attention : Stock bas détecté !</h4>
            <p className="text-xs text-rose-600/95 mt-0.5">
              Il y a <strong>{lowStockCount}</strong> {lowStockCount > 1 ? 'articles' : 'article'} dont le niveau de stock est inférieur ou égal à leur seuil d'alerte configuré.
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom d'article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-semibold transition-all focus:border-amber-200 focus:bg-white"
          />
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: primaryColor }}
          className="text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle size={15} />
          <span>Créer un Article</span>
        </button>
      </div>

      {/* Grid of detailed products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isLow = p.stock <= p.seuil;
          const isOut = p.stock === 0;

          // Estimated profit potential per unit
          const profitMargin = p.pv - p.pr;

          return (
            <motion.div
              key={p.id}
              layout
              className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between transition-all ${
                isOut 
                  ? 'border-rose-300 shadow-rose-50/50' 
                  : isLow 
                    ? 'border-orange-300 shadow-orange-50/50' 
                    : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-black text-slate-800 text-sm leading-snug line-clamp-2">{p.nom}</h4>
                  <button 
                    onClick={() => handleDeleteClick(p.id, p.nom)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-1 shrink-0"
                    title="Supprimer le produit"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50/50 rounded-xl px-3 my-3">
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase">Prix Vente</span>
                    <span className="font-black text-slate-700">{formatXOF(p.pv)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase">Bénéfice/U</span>
                    <span className="font-black text-emerald-600">+{formatXOF(profitMargin)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex justify-between items-center mt-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">En Stock</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base font-black ${isOut ? 'text-rose-600' : isLow ? 'text-orange-500' : 'text-slate-700'}`}>
                      {p.stock}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold italic">
                      (seuil: {p.seuil})
                    </span>
                  </div>
                </div>

                {/* Stock Incrementor Decrementor */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => onModifyStock(p.id, -1)}
                    disabled={p.stock <= 0}
                    className="p-1.5 bg-white text-slate-600 rounded-lg hover:text-rose-500 hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-700">{p.stock}</span>
                  <button
                    onClick={() => onModifyStock(p.id, 1)}
                    className="p-1.5 bg-white text-slate-600 rounded-lg hover:text-emerald-500 hover:shadow-xs active:scale-95 transition-all"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-sm font-bold text-slate-500">Aucun produit dans l'inventaire</p>
            <p className="text-xs text-slate-400 mt-1">Créez votre premier article en cliquant sur le bouton ci-dessus !</p>
          </div>
        )}
      </div>

      {/* Modal addition */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="modal-produit-overlay" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="text-base font-black uppercase italic text-slate-800">Ajouter un Nouvel Article</h3>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nom de l'article *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Collier Diamant Royal, Bracelet Onyx..."
                    value={newNom}
                    onChange={(e) => setNewNom(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prix de Vente (FCFA) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ex: 85000"
                      value={newPv}
                      onChange={(e) => setNewPv(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-amber-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prix de Revient (FCFA) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ex: 50000"
                      value={newPr}
                      onChange={(e) => setNewPr(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stock Initial *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ex: 10"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold focus:bg-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Seuil d'Alerte</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Default: 2"
                      value={newSeuil}
                      onChange={(e) => setNewSeuil(Number(e.target.value) || 0)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-semibold focus:bg-white text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 p-3.5 border border-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: primaryColor }}
                    className="flex-1 p-3.5 text-white rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all"
                  >
                    Créer l'Article
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
