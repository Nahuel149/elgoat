'use client';

import React, { useState, useMemo } from 'react';
import { Player } from '@/lib/types';
import { Search, Trophy, Flame, Plus, Sparkles, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  onVote: (player: Player) => void;
  onOpenAddPlayer: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  onVote,
  onOpenAddPlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'argentina' | 'international' | 'memes'>('all');

  const leaderAmount = players[0]?.totalAmount || 1;

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.nickname?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'argentina') {
        return player.country.includes('Argentina');
      }
      if (filterType === 'international') {
        return !player.country.includes('Argentina');
      }
      if (filterType === 'memes') {
        return Boolean(player.isMeme);
      }
      return true;
    });
  }, [players, searchTerm, filterType]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header with Title and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Tabla de Posiciones Oficial</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {players.length} candidatos
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ordenado estrictamente por recaudación en pesos argentinos
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ídolo, club o apodo..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          🏆 Todos ({players.length})
        </button>
        <button
          onClick={() => setFilterType('argentina')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            filterType === 'argentina'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          🇦🇷 Industria Nacional
        </button>
        <button
          onClick={() => setFilterType('international')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            filterType === 'international'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          🌍 Internacionales
        </button>
        <button
          onClick={() => setFilterType('memes')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            filterType === 'memes'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          🔥 Joyas y Memes
        </button>
      </div>

      {/* Players List Table */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
            <p className="text-sm font-semibold text-zinc-300">
              No encontramos a ningún jugador con &quot;{searchTerm}&quot;
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              ¿Tu ídolo no está en la lista? ¡Podés postularlo ahora mismo y ser el primero en bancarlo!
            </p>
            <button
              onClick={onOpenAddPlayer}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-all shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Postular a &quot;{searchTerm}&quot;</span>
            </button>
          </div>
        ) : (
          filteredPlayers.map((player, index) => {
            // Find global rank in unfiltered list
            const globalRank = players.findIndex((p) => p.id === player.id) + 1;
            const progressPercent = Math.max(8, Math.round((player.totalAmount / (leaderAmount || 1)) * 100));

            return (
              <div
                key={player.id}
                className={`relative group overflow-hidden rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
                  globalRank === 1
                    ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-zinc-900/90 to-zinc-900/90 shadow-lg shadow-amber-950/20'
                    : globalRank === 2
                    ? 'border-slate-600/50 bg-gradient-to-r from-slate-900/40 to-zinc-900/80'
                    : globalRank === 3
                    ? 'border-amber-800/40 bg-gradient-to-r from-amber-950/20 to-zinc-900/80'
                    : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                {/* Progress bar fill background */}
                <div
                  className={`absolute top-0 bottom-0 left-0 opacity-10 transition-all duration-500 pointer-events-none ${
                    globalRank === 1
                      ? 'bg-amber-400'
                      : globalRank <= 3
                      ? 'bg-sky-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Rank, Avatar and Info */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl font-black text-sm sm:text-base ${
                        globalRank === 1
                          ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                          : globalRank === 2
                          ? 'bg-slate-300 text-zinc-950 font-bold'
                          : globalRank === 3
                          ? 'bg-amber-700 text-amber-100 font-bold'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      #{globalRank}
                    </div>

                    {/* Avatar */}
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full border-2 border-zinc-700 overflow-hidden bg-zinc-800">
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-white truncate">
                          {player.name}
                        </span>
                        {player.nickname && (
                          <span className="text-xs text-amber-300/90 italic hidden md:inline">
                            ({player.nickname})
                          </span>
                        )}
                        {player.isMeme && (
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-black text-red-400 border border-red-500/30">
                            MEME KING
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>{player.club}</span>
                        <span>•</span>
                        <span>{player.country}</span>
                        <span>•</span>
                        <span className="text-zinc-500">{player.votesCount} votos</span>
                      </div>

                      {player.highlightNote && (
                        <p className="text-[11px] text-zinc-400/90 mt-1 line-clamp-1 italic">
                          {player.highlightNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Vote Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-zinc-800/60 pt-3 sm:border-t-0 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-zinc-400 font-semibold">Total Bancado</div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400">
                        ${player.totalAmount.toLocaleString('es-AR')} <span className="text-xs text-zinc-500">ARS</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onVote(player)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all shadow-md active:scale-95 ${
                        globalRank === 1
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-zinc-950 shadow-amber-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>BANCAR</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Suggest Player Banner */}
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">¿Falta tu ídolo o tu meme preferido?</h4>
            <p className="text-xs text-zinc-400">
              Podés postular a cualquier jugador de fútbol (actual, histórico o meme) para empezar a bancarlo.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddPlayer}
          className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2.5 transition-all shrink-0"
        >
          Postular Nuevo Jugador
        </button>
      </div>
    </section>
  );
};
