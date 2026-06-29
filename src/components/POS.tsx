/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { Search, ShoppingBag, CheckCircle, Clock, Printer, ArrowRight, User, CircleDollarSign, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface POSProps {
  produits: Product[];
  ventes: Sale[];
  onAddSale: (sale: Omit<Sale, 'id' | 'date' | 'reference'>) => void;
  onReprint: (sale: Sale) => void;
  primaryColor: string;
}

export default function POS({ produits = [], ventes = [], onAddSale, onReprint, primaryColor }: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [editablePrice, setEditablePrice] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('MTN MoMo');
  const [status, setStatus] = useState<'Payé' | 'En attente'>('Payé');

  // Filter and search variables
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');

  // Helper formatting
  const formatXOF = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const selectedProduct = produits.find(p => p.id === selectedProductId);

  // When product changes, auto-populate the default unit price
  const handleProductChange = (prodIdStr: string) => {
    if (prodIdStr === '') {
      setSelectedProductId('');
      setEditablePrice('');
      return;
    }
    const id = Number(prodIdStr);
    setSelectedProductId(id);
    const prod = produits.find(p => p.id === id);
    if (prod) {
      setEditablePrice(prod.pv);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert("Veuillez sélectionner un produit.");
      return;
    }
    if (!clientName.trim()) {
      alert("Veuillez entrer le nom du client.");
      return;
    }
    const prod = produits.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (prod.stock < quantity) {
      alert(`Stock insuffisant ! Il ne reste que ${prod.stock} unités.`);
      return;
    }

    const price = Number(editablePrice) || prod.pv;

    onAddSale({
      nom: prod.nom,
      client: clientName.trim(),
      qte: quantity,
      pv: price,
      total: price * quantity,
      statut: status,
      modePaiement: status === 'Payé' ? paymentMode : 'Attente'
    });

    // Reset Form
    setClientName('');
    setSelectedProductId('');
    setQuantity(1);
    setEditablePrice('');
    setStatus('Payé');
  };

  // Quick select from catalog list
  const handleSelectFromGrid = (prod: Product) => {
    if (prod.stock <= 0) {
      alert("Cet article est en rupture de stock.");
      return;
    }
    setSelectedProductId(prod.id);
    setEditablePrice(prod.pv);
    setQuantity(1);
    // Scroll to checkout form
    document.getElementById('pos-form-panel')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered lists of products
  const searchedProducts = produits.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered sales history for POS list
  const filteredSalesHistory = [...ventes].reverse().filter(v => {
    const matchesSearch = v.nom.toLowerCase().includes(listSearch.toLowerCase()) || 
                          v.client.toLowerCase().includes(listSearch.toLowerCase()) ||
                          v.reference.toLowerCase().includes(listSearch.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || v.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="pos-interactive-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. SELECTION DES ARTICLES (Grid - Left Panel, 7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div>
            <h3 className="font-black italic text-sm text-slate-800 uppercase tracking-tight">Perles & Joyaux</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Cliquez pour ajouter au panier</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Rechercher collier, nacre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-semibold focus:bg-white"
            />
          </div>
        </div>

        {/* Catalog grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
          {searchedProducts.map((p) => {
            const isLow = p.stock <= p.seuil;
            const isOut = p.stock === 0;
            const isSelected = selectedProductId === p.id;

            return (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectFromGrid(p)}
                style={{
                  borderColor: isSelected ? primaryColor : undefined,
                  backgroundColor: isSelected ? `${primaryColor}0a` : undefined,
                }}
                className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-2 shadow-xs'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-slate-800 text-xs leading-tight line-clamp-2">{p.nom}</p>
                    <span
                      className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                        isOut
                          ? 'bg-rose-100 text-rose-700'
                          : isLow
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOut ? 'Rupture' : isLow ? 'Seuil bas' : `${p.stock} dispos`}
                    </span>
                  </div>
                  <p className="text-xs font-black text-amber-600 mt-1.5">{formatXOF(p.pv)}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-50 mt-3 pt-2">
                  <span>En stock</span>
                  <span className={`font-black ${isOut ? 'text-rose-500' : 'text-slate-700'}`}>{p.stock} unités</span>
                </div>
              </motion.div>
            );
          })}

          {searchedProducts.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-400">Aucun produit trouvé</p>
            </div>
          )}
        </div>

        {/* HISTORIQUE DES VENTES LIST */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-4">
            <div>
              <h3 className="font-black italic text-xs text-slate-800 uppercase tracking-tight">Toutes les Ventes</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Historique complet</p>
            </div>

            <div className="flex gap-2">
              {/* Filter input */}
              <input
                type="text"
                placeholder="Réf, client..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="bg-slate-50 border border-slate-100 text-xs rounded-xl px-2.5 py-1.5 outline-none font-semibold w-28 sm:w-36 focus:bg-white"
              />

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 text-xs rounded-xl px-2 py-1.5 font-bold outline-none"
              >
                <option value="Tous">Tous</option>
                <option value="Payé">Payé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredSalesHistory.length > 0 ? (
              filteredSalesHistory.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="space-y-1 max-w-[65%]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-amber-700 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        {v.reference}
                      </span>
                      <span className="font-black text-slate-800">{v.client}</span>
                    </div>
                    <p className="text-slate-500 font-bold line-clamp-1 text-[11px]">{v.nom} <span className="text-slate-400 font-normal">(x{v.qte})</span></p>
                    <div className="text-[9px] text-slate-400 flex items-center gap-1.5">
                      <span>{v.date}</span>
                      <span>•</span>
                      <span>Paiement: {v.modePaiement || "Inconnu"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-black text-slate-800 block">{formatXOF(v.total)}</span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          v.statut === 'Payé'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        {v.statut}
                      </span>
                    </div>

                    <button
                      onClick={() => onReprint(v)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                      title="Imprimer Reçu"
                    >
                      <Printer size={13} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-400 text-xs font-semibold">Aucune vente correspondante.</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. ENREGISTREMENT DE LA VENTE (Form - Right Panel, 5 cols) */}
      <div id="pos-form-panel" className="lg:col-span-5 space-y-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="font-black italic text-sm text-slate-800 uppercase tracking-tight">Nouvel Enregistrement</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Caisse Pearl Benin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Name Input */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nom du Client *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={15} />
                <input
                  type="text"
                  required
                  placeholder="Ex: Mme. Akindé"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-700 focus:bg-white"
                />
              </div>
            </div>

            {/* Product selection dropdown */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Choisir l'article *</label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs text-slate-700 focus:bg-white"
              >
                <option value="">-- Sélectionnez l'article --</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.nom} ({p.stock} dispo) - {formatXOF(p.pv)}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Unit Price (Important for bargaining) */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prix Unitaire de Vente (Editable) *</label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-3 text-slate-400" size={15} />
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ex: 145000"
                  value={editablePrice}
                  onChange={(e) => setEditablePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold text-amber-600 focus:bg-white"
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-1 italic">
                Saisissez le prix négocié ou laissez le prix d'origine par défaut.
              </p>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Quantité *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none text-center focus:bg-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Statut *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Payé' | 'En attente')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:bg-white"
                >
                  <option value="Payé">Payé (Encaissé)</option>
                  <option value="En attente">En attente (Créance)</option>
                </select>
              </div>
            </div>

            {/* Payment Mode Selection */}
            {status === 'Payé' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mode de règlement</label>
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
              </motion.div>
            )}

            {/* Calculation summary info */}
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Produit:</span>
                  <span className="font-bold text-slate-800 line-clamp-1 max-w-[150px]">{selectedProduct.nom}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Prix unitaire:</span>
                  <span className="font-bold text-slate-700">{formatXOF(Number(editablePrice) || selectedProduct.pv)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Quantité:</span>
                  <span className="font-bold text-slate-700">x{quantity}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-black">TOTAL NET :</span>
                  <span className="text-sm font-black text-amber-600">
                    {formatXOF((Number(editablePrice) || selectedProduct.pv) * quantity)}
                  </span>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!selectedProductId || !clientName.trim()}
              style={{ backgroundColor: (selectedProductId && clientName.trim()) ? primaryColor : '#cbd5e1' }}
              className="w-full text-white font-black py-4 rounded-xl uppercase shadow-sm tracking-wider text-xs active:scale-95 transition-all disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span>Valider & Générer Ticket</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
