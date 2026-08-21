'use client';

import React from 'react';
import { Player, LeaderboardStats } from '@/lib/types';
import { Trophy, TrendingUp, DollarSign, Users, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface HeroProps {
  stats: LeaderboardStats;
  onVotePlayer: (player?: Player) => void;
  players: Player[];
}

export const Hero: React.FC<HeroProps> = ({ stats, onVotePlayer, players }) => {
  const leader = stats.leaderPlayer;
  const runnerUp = players[1];

  const diffToLeader = leader && runnerUp ? Math.max(0, leader.totalAmount - runnerUp.totalAmount) : 0;

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-grid-pattern">
      {/* Glow ambient background circles */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        {/* Provocative Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md mb-6">
          <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>La Batalla Definitiva del Fútbol Mundial</span>
          <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-200">
            Mercado Pago
          </span>
        </div>

        {/* Title */}
        <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.1]">
          ¿Quién es el <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-600">Mejor Jugador</span> de la Historia?
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-lg text-zinc-300 leading-relaxed font-medium">
          Basta de encuestas truchas de Twitter y debates de periodistas. 
          Acá el ranking lo define <span className="text-amber-300 font-bold underline decoration-amber-500/50">la plata que pone cada hinchada</span> por su ídolo.
        </p>

        {/* Provocative Meme Callout if Hauche or underdog is leading */}
        {leader?.isMeme && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/60 via-zinc-900/80 to-red-950/60 p-3.5 backdrop-blur-md text-left flex items-start gap-3 shadow-lg shadow-red-950/50">
            <span className="text-2xl mt-0.5">🚨</span>
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-red-200">
                ¡ALERTA HISTÓRICA! {leader.name} lidera el ranking con ${leader.totalAmount.toLocaleString('es-AR')} ARS
              </p>
              <p className="text-zinc-300 text-xs mt-0.5">
                ¿Vas a dejar que el Demonio esté arriba de Messi y Maradona? Poné plata por tu 10 o callate para siempre.
              </p>
            </div>
            {runnerUp && (
              <button
                onClick={() => onVotePlayer(runnerUp)}
                className="self-center rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 transition-all shrink-0"
              >
                Salvar a {runnerUp.name.split(' ')[0]}
              </button>
            )}
          </div>
        )}

        {/* Global Metric Cards */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Card 1: Total Recaudado */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md text-left transition-all hover:border-zinc-700">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Total en Juego</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400">
              ${stats.totalRaised.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">en votos reales (ARS)</p>
          </div>

          {/* Card 2: Líder Actual */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-zinc-900/60 p-4 backdrop-blur-md text-left transition-all hover:border-amber-500/60">
            <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
              <span>Líder #1</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-black text-white truncate">
              {leader ? leader.name : 'Sin votos'}
            </div>
            <p className="text-[11px] text-amber-400/90 mt-0.5 font-medium">
              ${leader ? leader.totalAmount.toLocaleString('es-AR') : 0} acumulados
            </p>
          </div>

          {/* Card 3: Votos Totales */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md text-left transition-all hover:border-zinc-700">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Votos Emitidos</span>
              <Users className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-white">
              {stats.totalVotes}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">hinchas bancando</p>
          </div>

          {/* Card 4: Brecha para la punta */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md text-left transition-all hover:border-zinc-700">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Para destronar al #1</span>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-black text-purple-300">
              {diffToLeader > 0 ? `+$${(diffToLeader + 100).toLocaleString('es-AR')}` : '$0'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {runnerUp ? `necesita ${runnerUp.name.split(' ')[0]}` : 'nadie compite'}
            </p>
          </div>
        </div>

        {/* CTA Banner Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onVotePlayer(players.find(p => p.id === 'messi') || players[0])}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>👑 Bancar a Messi</span>
          </button>

          <button
            onClick={() => onVotePlayer(players.find(p => p.id === 'maradona') || players[1])}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>🔟 Bancar al Diego</span>
          </button>

          <button
            onClick={() => onVotePlayer(players.find(p => p.id === 'hauche') || players[0])}
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-3 text-sm font-bold text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95"
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Demonio Hauche al #1</span>
          </button>
        </div>
      </div>
    </section>
  );
};
