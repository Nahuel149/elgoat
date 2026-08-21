'use client';

import React, { useState } from 'react';
import { Share2, Check, Send, Flame } from 'lucide-react';
import { Player } from '@/lib/types';

interface ShareBarProps {
  leader: Player | null;
}

export const ShareBar: React.FC<ShareBarProps> = ({ leader }) => {
  const [copied, setCopied] = useState(false);

  const leaderName = leader?.name || 'Gabriel Hauche';
  const leaderAmount = leader ? leader.totalAmount.toLocaleString('es-AR') : '20.000';

  const shareText = `🚨 NO PUEDE SER: ${leaderName} tiene $${leaderAmount} ARS y va ganando el ranking del MEJOR JUGADOR DE LA HISTORIA arriba de Messi y Maradona 💀\n\nEntrá y poné guita por tu 10 antes de que sea tarde 👇`;

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(`${shareText}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitterShare = () => {
    const url = window.location.origin;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = window.location.origin;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText}\n${url}`
    )}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-sm mx-auto z-30">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-2.5 backdrop-blur-md shadow-xl shadow-slate-300/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 text-xs">
            🔥
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-800 truncate">
              {leaderName} en #1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleTwitterShare}
            title="Compartir en X"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all"
          >
            𝕏
          </button>

          <button
            onClick={handleWhatsAppShare}
            title="Compartir en WhatsApp"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
          >
            <Send className="h-3 w-3" />
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-xs font-bold transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3" />
                <span>Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
