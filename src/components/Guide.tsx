/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Cloud, Database, Wifi, Shield, RefreshCw } from 'lucide-react';

interface GuideProps {
  primaryColor: string;
}

export default function Guide({ primaryColor }: GuideProps) {
  return (
    <div id="guide-documentation-module" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="font-black italic text-base text-slate-800 uppercase tracking-tight">Guide Pearl Benin Sync Pro</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Manuel d'utilisation & Synchronisation Cloud</p>
        </div>
      </div>

      {/* Intro section */}
      <div className="text-xs text-slate-600 leading-relaxed space-y-2">
        <p>
          Bienvenue dans l'application commerciale officielle <strong>Pearl Benin Pro</strong> ! Cette application a été conçue pour remplacer avantageusement votre fichier Excel de suivi de caisse et d'inventaire, en y ajoutant des fonctionnalités avancées et une synchronisation cloud en temps réel.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Sync Live */}
        <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider">
            <Cloud size={14} />
            <span>Synchronisation Cloud Live</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Chaque vente validée, modification de stock ou ajustement d'identité est instantanément sauvegardé sur votre base de données Cloud en ligne. Plusieurs terminaux (téléphones, ordinateurs) peuvent y accéder en simultané.
          </p>
        </div>

        {/* Offline First */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase tracking-wider">
            <Wifi size={14} style={{ color: primaryColor }} />
            <span>Mode Hors-Ligne Résistant</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Pas de connexion internet ? L'application continue de fonctionner normalement ! Les ventes sont persistées en toute sécurité dans la mémoire locale de votre navigateur, puis poussées vers le Cloud dès qu'une connexion est rétablie.
          </p>
        </div>
      </div>

      {/* How to configure section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Database size={14} style={{ color: primaryColor }} />
          Comment brancher votre propre base de données Cloud ?
        </h4>

        <div className="text-xs text-slate-600 leading-relaxed space-y-3">
          <p>
            Par défaut, l'application est branchée sur une base de données de test et de démonstration sécurisée. Pour prendre le contrôle exclusif de vos données commerciales privées, suivez ces 4 étapes simples :
          </p>

          <ol className="list-decimal list-inside space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] font-semibold text-slate-600">
            <li>
              Allez sur la <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-amber-600 underline">Console Google Firebase</a> et créez un projet gratuit.
            </li>
            <li>
              Activez le module <strong>Realtime Database</strong> dans la section Build, puis choisissez l'onglet "Règles" et mettez les règles en accès libre public : 
              <pre className="bg-slate-900 text-amber-200 p-2.5 rounded-lg text-[9px] font-mono mt-1.5 overflow-x-auto">
{`{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}`}
              </pre>
            </li>
            <li>
              Dans les paramètres de votre projet Firebase, ajoutez une application Web pour obtenir vos clés de configuration (API Key, Database URL, App ID).
            </li>
            <li>
              Ouvrez l'onglet <strong>Paramètres (⚙️)</strong> de cette application, déployez la section "Paramètres avancés Firebase", insérez vos clés correspondantes, et cliquez sur <strong>Appliquer les Clés</strong> !
            </li>
          </ol>

          <p className="text-[10px] text-amber-700 font-bold bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 flex gap-1.5 items-start">
            <Shield size={14} className="shrink-0 mt-0.5" />
            <span>Vos informations privées de synchronisation Firebase sont enregistrées localement de manière sécurisée dans la mémoire de votre propre navigateur.</span>
          </p>
        </div>
      </div>

      {/* Guide usage */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <RefreshCw size={14} style={{ color: primaryColor }} />
          Meilleures pratiques opérationnelles
        </h4>

        <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-500 font-medium">
          <li><strong>Bénéfice Réel :</strong> Veillez à bien saisir vos Prix de Revient (achat initial) dans l'onglet Stocks pour obtenir une analyse ultra-précise de vos bénéfices nets d'activité.</li>
          <li><strong>Impression des Tickets :</strong> Après chaque vente, un ticket virtuel de caisse s'ouvre. Il est formaté pour s'imprimer parfaitement sur des imprimantes thermiques de reçus (largeur 58mm/80mm) ou sur du papier standard.</li>
          <li><strong>Suivi des Créances :</strong> Si un client achète un article sans payer la totalité immédiatement, sélectionnez le statut "En attente". Vous retrouverez et pourrez solder cette créance en un clic depuis l'onglet dédié de l'application !</li>
        </ul>
      </div>

    </div>
  );
}
