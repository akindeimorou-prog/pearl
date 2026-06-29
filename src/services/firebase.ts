/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, Database } from 'firebase/database';
import { AppData, FirebaseCredentials } from '../types';

export const DEFAULT_FIREBASE_CONFIG: FirebaseCredentials = {
  apiKey: "AIzaSyBdQhvLMpBcnPyofeGty6PQltwcWcq3j-E",
  authDomain: "pearlbeninsync.firebaseapp.com",
  databaseURL: "https://pearlbeninsync-default-rtdb.firebaseio.com",
  projectId: "pearlbeninsync",
  storageBucket: "pearlbeninsync.firebasestorage.app",
  messagingSenderId: "1053541457752",
  appId: "1:1053541457752:web:bf40de80cb02d1c87f4f2d",
  measurementId: "G-DDMP30LFZG"
};

const CONFIG_KEY = 'pearl_benin_fb_config';

export function getStoredFirebaseConfig(): FirebaseCredentials {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading custom Firebase config, using default.', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config: FirebaseCredentials) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function resetFirebaseConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

// Global reference holders
let currentApp: FirebaseApp | null = null;
let currentDb: Database | null = null;
let currentUnsubscribe: (() => void) | null = null;

export function initializeFirebaseService(
  onDataReceived: (data: AppData) => void,
  onStatusChanged: (status: 'connecting' | 'synced' | 'offline' | 'error', errorMsg?: string) => void
) {
  // Cleanup previous instance if any
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  const config = getStoredFirebaseConfig();

  onStatusChanged('connecting');

  try {
    // Delete existing named app if changing config
    if (getApps().length > 0) {
      // Reinitialize
      currentApp = getApp();
    } else {
      currentApp = initializeApp(config);
    }

    currentDb = getDatabase(currentApp);
    const dbRef = ref(currentDb, 'pearl_benin_data');

    currentUnsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          onDataReceived(val);
          onStatusChanged('synced');
        } else {
          // No data in cloud yet
          onStatusChanged('offline', "Aucune donnée sur le cloud. Création de données initiales...");
        }
      },
      (error) => {
        console.error("Firebase listen failed:", error);
        onStatusChanged('error', error.message);
      }
    );
  } catch (error: any) {
    console.error("Firebase init failed:", error);
    onStatusChanged('error', error?.message || 'Erreur d\'initialisation');
  }
}

export async function pushDataToCloud(data: AppData): Promise<boolean> {
  if (!currentDb) {
    console.warn("Cannot push data: Database not initialized");
    return false;
  }
  try {
    const dbRef = ref(currentDb, 'pearl_benin_data');
    await set(dbRef, data);
    return true;
  } catch (error) {
    console.error("Error pushing to cloud:", error);
    return false;
  }
}

// Initial default data if none exists
export const DEFAULT_INITIAL_DATA: AppData = {
  config: {
    brand: "Pearl Benin",
    primary: "#B8973A",
    dark: "#1A1A1A",
    logo: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80" // Beautiful pearl image placeholder
  },
  produits: [
    { id: 1, nom: "Collier Perles d'Eau Douce Royal", pv: 145000, pr: 85000, stock: 12, seuil: 3 },
    { id: 2, nom: "Bracelet Jaspe Rouge Impérial", pv: 45000, pr: 22000, stock: 25, seuil: 5 },
    { id: 3, nom: "Boucles d'Oreilles Nacre & Or", pv: 78000, pr: 40000, stock: 8, seuil: 2 },
    { id: 4, nom: "Pendentif Azurite Sacrée", pv: 110000, pr: 60000, stock: 2, seuil: 3 },
    { id: 5, nom: "Collier de Perles de Corail Dahomey", pv: 220000, pr: 125000, stock: 5, seuil: 2 }
  ],
  ventes: [
    {
      id: 1719652000000,
      reference: "PB-260629-01",
      nom: "Collier Perles d'Eau Douce Royal",
      client: "Mme. Salami",
      qte: 1,
      pv: 145000,
      total: 145000,
      date: "29/06/2026",
      statut: "Payé",
      modePaiement: "MTN MoMo"
    },
    {
      id: 1719653000000,
      reference: "PB-260629-02",
      nom: "Bracelet Jaspe Rouge Impérial",
      client: "M. Gbaguidi",
      qte: 2,
      pv: 45000,
      total: 90000,
      date: "29/06/2026",
      statut: "En attente",
      modePaiement: "Espèces"
    }
  ]
};
