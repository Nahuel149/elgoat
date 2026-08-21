'use client';

import React from 'react';
import { Vote } from '@/lib/types';
import { Flame, MessageSquare, Clock, Sparkles } from 'lucide-react';

interface ActivityFeedProps {
  activity: Vote[];
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activity }) => {
  if (!activity || activity.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>Tribuna en Vivo</span>
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
              (Últimos votos y chicanas)
            </span>
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-semibold">
          {activity.length} donaciones registradas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activity.slice(0, 8).map((vote) => (
          <div
            key={vote.id}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 backdrop-blur-md transition-all hover:border-zinc-700 flex flex-col justify-between"
          >
            <div>
              {/* Header: Donor & Amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                    ⚽
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-zinc-200">
                      {vote.donorName}
                    </span>
                    <span className="text-[11px] text-zinc-400 ml-1.5">
                      bancó a <strong className="text-white">{vote.playerName}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-black text-emerald-400">
                    +${vote.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Comment / Chicana if present */}
              {vote.comment && (
                <div className="mt-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 p-2.5 text-xs text-zinc-300 italic flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">&quot;{vote.comment}&quot;</p>
                </div>
              )}
            </div>

            {/* Footer time */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(vote.createdAt)}
              </span>
              {vote.isSimulation && (
                <span className="text-amber-500/70 font-semibold">Demo Test</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
