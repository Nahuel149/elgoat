'use client';

import React from 'react';
import { Player } from '@/lib/types';
import { Trophy, Crown, Sparkles, Flame, ArrowUpRight } from 'lucide-react';

interface PodiumProps {
  topPlayers: Player[];
  totalPool: number;
  onVote: (player: Player) => void;
}

export const Podium: React.FC<PodiumProps> = ({ topPlayers, totalPool, onVote }) => {
  const first = topPlayers[0];
  const second = topPlayers[1];
  const third = topPlayers[2];

  if (!first) return null;

  const getPercentage = (amount: number) => {
    if (!totalPool || totalPool === 0) return 0;
    return Math.round((amount / totalPool) * 100);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Trophy className="h-4 w-4" />
          <span>El Podio de los Dioses</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Top 3 en Carrera por el Trono
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* 2ND PLACE (PUESTO 2) */}
        {second ? (
          <div className="order-2 md:order-1 relative rounded-3xl border border-slate-600/40 bg-gradient-to-b from-slate-800/40 via-zinc-900/60 to-zinc-950/80 p-5 backdrop-blur-md transition-all hover:border-slate-400/60 shadow-xl">
            {/* Rank badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-slate-300 px-3 py-0.5 text-xs font-black text-zinc-950 shadow-md">
              <span>#2 PLATA</span>
            </div>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="relative h-24 w-24 rounded-full border-4 border-slate-300/40 overflow-hidden shadow-lg bg-zinc-800">
                <img
                  src={second.photoUrl}
                  alt={second.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <h3 className="mt-3 text-lg font-black text-white truncate max-w-[200px]">
                {second.name}
              </h3>
              <p className="text-xs text-zinc-400 font-medium">{second.club}</p>
              {second.nickname && (
                <span className="text-[11px] text-amber-300/90 italic mt-0.5">
                  &quot;{second.nickname}&quot;
                </span>
              )}

              {/* Amount */}
              <div className="mt-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 px-4 py-2 w-full">
                <div className="text-xs text-zinc-400 font-semibold">Total Bancado</div>
                <div className="text-xl font-black text-slate-200">
                  ${second.totalAmount.toLocaleString('es-AR')}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{second.votesCount} votos</span>
                  <span className="font-bold text-slate-300">{getPercentage(second.totalAmount)}% del pozo</span>
                </div>
              </div>

              {first && (
                <p className="mt-2 text-[11px] text-amber-400/80">
                  A sólo ${(first.totalAmount - second.totalAmount + 100).toLocaleString('es-AR')} del puesto #1
                </p>
              )}

              <button
                onClick={() => onVote(second)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-200 hover:bg-white text-zinc-950 font-bold text-xs py-2.5 transition-all shadow-md active:scale-95"
              >
                <span>Bancar a {second.name.split(' ')[0]}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 hidden md:block" />
        )}

        {/* 1ST PLACE (PUESTO 1 - EL LÍDER) */}
        <div className="order-1 md:order-2 relative rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-500/20 via-zinc-900/80 to-zinc-950 p-6 backdrop-blur-md shadow-2xl glow-gold transform md:-translate-y-4">
          {/* King Crown */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <Crown className="h-8 w-8 text-yellow-400 animate-bounce drop-shadow-[0_4px_8px_rgba(234,179,8,0.8)]" />
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-0.5 text-xs font-black text-zinc-950 shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              <span>#1 EL GOAT ACTUAL</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mt-4">
            <div className="relative h-32 w-32 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl bg-zinc-800 ring-4 ring-amber-500/30">
              <img
                src={first.photoUrl}
                alt={first.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {first.isMeme && (
                <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[9px] font-black py-0.5 uppercase tracking-wider">
                  🔥 MEME POWER
                </div>
              )}
            </div>

            <h3 className="mt-3 text-2xl font-black text-white tracking-tight">
              {first.name}
            </h3>
            <p className="text-sm text-zinc-300 font-semibold">{first.club}</p>
            {first.nickname && (
              <span className="text-xs text-amber-300 font-bold italic mt-0.5">
                &quot;{first.nickname}&quot;
              </span>
            )}

            {first.highlightNote && (
              <p className="mt-2 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 max-w-xs">
                {first.highlightNote}
              </p>
            )}

            {/* Big Amount */}
            <div className="mt-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 p-3.5 w-full">
              <div className="text-xs text-amber-300/80 font-bold uppercase tracking-wider">
                👑 Monto del Trono
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200">
                ${first.totalAmount.toLocaleString('es-AR')}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
                <span>{first.votesCount} votos</span>
                <span className="font-bold text-amber-400">{getPercentage(first.totalAmount)}% del total</span>
              </div>
            </div>

            <button
              onClick={() => onVote(first)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-sm py-3 transition-all shadow-lg shadow-amber-500/30 active:scale-95"
            >
              <Flame className="h-4 w-4 text-zinc-950 fill-current" />
              <span>BANCAR AL LÍDER #{first.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* 3RD PLACE (PUESTO 3) */}
        {third ? (
          <div className="order-3 relative rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-950/20 via-zinc-900/60 to-zinc-950/80 p-5 backdrop-blur-md transition-all hover:border-amber-600/60 shadow-xl">
            {/* Rank badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-amber-700 px-3 py-0.5 text-xs font-black text-amber-100 shadow-md">
              <span>#3 BRONCE</span>
            </div>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="relative h-24 w-24 rounded-full border-4 border-amber-700/50 overflow-hidden shadow-lg bg-zinc-800">
                <img
                  src={third.photoUrl}
                  alt={third.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <h3 className="mt-3 text-lg font-black text-white truncate max-w-[200px]">
                {third.name}
              </h3>
              <p className="text-xs text-zinc-400 font-medium">{third.club}</p>
              {third.nickname && (
                <span className="text-[11px] text-amber-300/90 italic mt-0.5">
                  &quot;{third.nickname}&quot;
                </span>
              )}

              {/* Amount */}
              <div className="mt-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 px-4 py-2 w-full">
                <div className="text-xs text-zinc-400 font-semibold">Total Bancado</div>
                <div className="text-xl font-black text-amber-200/90">
                  ${third.totalAmount.toLocaleString('es-AR')}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{third.votesCount} votos</span>
                  <span className="font-bold text-amber-400">{getPercentage(third.totalAmount)}% del pozo</span>
                </div>
              </div>

              {first && (
                <p className="mt-2 text-[11px] text-zinc-400">
                  A ${(first.totalAmount - third.totalAmount + 100).toLocaleString('es-AR')} de la punta
                </p>
              )}

              <button
                onClick={() => onVote(third)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-800/60 hover:bg-amber-700/80 text-amber-100 font-bold text-xs py-2.5 transition-all shadow-md active:scale-95 border border-amber-700/50"
              >
                <span>Bancar a {third.name.split(' ')[0]}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="order-3 hidden md:block" />
        )}
      </div>
    </section>
  );
};
