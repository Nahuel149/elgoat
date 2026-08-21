'use client';

import React from 'react';
import { Player } from '@/lib/types';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';

interface PlayerListCardsProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onOpenNewPlayerTab: () => void;
}

export const PlayerListCards: React.FC<PlayerListCardsProps> = ({
  players,
  onSelectPlayer,
  onOpenNewPlayerTab,
}) => {
  return (
    <section className="mx-auto max-w-lg px-4 py-6 space-y-4">
      {players.map((player, index) => {
        const rank = index + 1;

        // Custom borders and pills per rank
        let cardStyle = 'border border-slate-200 bg-white hover:border-slate-300';
        let pillStyle = 'bg-slate-100 text-slate-700 font-bold';
        let amountStyle = 'text-slate-900';
        let linkStyle = 'text-slate-600 hover:text-slate-900';

        if (rank === 1) {
          cardStyle = 'border-2 border-yellow-400 bg-white shadow-lg shadow-yellow-400/10';
          pillStyle = 'bg-yellow-400 text-slate-950 font-black';
          amountStyle = 'text-amber-500 font-black';
          linkStyle = 'text-amber-500 font-bold hover:underline';
        } else if (rank === 2) {
          cardStyle = 'border-2 border-emerald-500 bg-white shadow-lg shadow-emerald-500/10';
          pillStyle = 'bg-emerald-500 text-white font-bold';
          amountStyle = 'text-emerald-600 font-black';
          linkStyle = 'text-emerald-600 font-bold hover:underline';
        } else if (rank === 3) {
          cardStyle = 'border-2 border-cyan-500 bg-white shadow-lg shadow-cyan-500/10';
          pillStyle = 'bg-cyan-500 text-white font-bold';
          amountStyle = 'text-cyan-600 font-black';
          linkStyle = 'text-cyan-600 font-bold hover:underline';
        }

        return (
          <div
            key={player.id}
            className={`rounded-3xl p-5 transition-all text-left ${cardStyle}`}
          >
            {/* Top row: Badge, time, and Amount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded-xl px-2.5 py-0.5 text-xs ${pillStyle}`}>
                  #{rank}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {rank === 1 ? 'hace 15 min' : rank === 2 ? 'hace 1 h' : 'hace 3 h'}
                </span>
              </div>

              <div className={`text-base sm:text-lg ${amountStyle}`}>
                ${player.totalAmount.toLocaleString('es-AR')}
              </div>
            </div>

            {/* Middle: Player Name & Bio */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {player.name}
                </h3>
                {player.isMeme && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md">
                    MEME
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {player.highlightNote || `${player.club} • ${player.country}`}
              </p>
            </div>

            {/* Bottom row: Club name & Action button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                {player.club}
              </span>

              <button
                onClick={() => onSelectPlayer(player)}
                className={`text-xs flex items-center gap-1 transition-all ${linkStyle}`}
              >
                <span>{rank === 1 ? 'Bancar el #1' : `Bancar a ${player.name.split(' ')[0]}`}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Prominent Bottom Postulate Card */}
      <div className="rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
          <Plus className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">
          ¿Tu ídolo o meme no está en la lista?
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Podés postular a cualquier jugador del fútbol mundial al instante.
        </p>
        <button
          onClick={onOpenNewPlayerTab}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Postular Nuevo Jugador</span>
        </button>
      </div>
    </section>
  );
};
