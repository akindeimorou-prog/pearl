/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: number;
  nom: string;
  pv: number; // Prix de vente (selling price)
  pr: number; // Prix de revient (cost price)
  stock: number;
  seuil: number; // Low stock alert threshold
}

export interface Sale {
  id: number;
  reference: string; // Unique sales reference, ex: PB-260629-01
  nom: string; // Product name at time of sale
  client: string; // Client name
  qte: number; // Quantity
  pv: number; // Unit price at time of sale (editable)
  total: number;
  date: string;
  statut: 'Payé' | 'En attente';
  modePaiement?: string; // MTN MoMo, Moov Flooz, Espèces, Chèque, etc.
}

export interface ShopConfig {
  brand: string;
  primary: string;
  dark: string;
  logo: string;
}

export interface AppData {
  config: ShopConfig;
  produits: Product[];
  ventes: Sale[];
}

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export type SyncState = 'connecting' | 'synced' | 'offline' | 'error';
