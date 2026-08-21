'use client';

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

interface HeaderProps {
  totalVotes?: number;
}

export const Header: React.FC<HeaderProps> = ({ totalVotes = 1240 }) => {
  const [viewers, setViewers] = useState(48);

  useEffect(() => {
    // Subtle realistic random viewer fluctuation
    const interval = setInterval(() => {
      setViewers((prev) => Math.max(32, prev + Math.floor(Math.random() * 5) - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="pt-8 pb-4 text-center">
      {/* Brand logo minimal */}
      <div className="inline-flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
          ⚽
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          elgoat<span className="text-emerald-600">.</span>
        </span>
      </div>

      {/* Subtitle */}
      <p className="mt-1 text-xs text-slate-500 font-medium">
        creado para <span className="font-semibold text-slate-700">Argentina 🇦🇷</span>
      </p>

      {/* Live Counter */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{viewers} mirando ahora</span>
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500 font-medium">{(totalVotes + 850).toLocaleString('es-AR')} en total</span>
      </div>
    </header>
  );
};
