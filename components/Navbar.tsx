'use client';

import React from 'react';
import { Trophy, Flame, PlusCircle, Share2, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAddPlayer: () => void;
  onOpenVote: () => void;
  leaderName?: string;
  isMpConfigured?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddPlayer,
  onOpenVote,
  leaderName = 'Gabriel Hauche',
  isMpConfigured = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 font-bold text-zinc-950 shadow-lg shadow-amber-500/20">
            <Trophy className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
              $
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white sm:text-lg">
                EL GOAT <span className="text-amber-400">DEFINITIVO</span>
              </span>
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 sm:inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              La única votación donde mandan los billetes 💸
            </p>
          </div>
        </div>

        {/* Live Leader Chip */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
          <Flame className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
          <span>Líder actual:</span>
          <strong className="font-bold text-white">{leaderName}</strong>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddPlayer}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            <PlusCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Postular</span> Jugador
          </button>

          <button
            onClick={onOpenVote}
            className="group relative flex items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
            <span>BANCAR JUGADOR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
