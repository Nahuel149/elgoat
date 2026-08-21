'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/types';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface BiddingHeroProps {
  leader: Player | null;
  onOpenCheckout: (amount: number, player?: Player) => void;
}

export const BiddingHero: React.FC<BiddingHeroProps> = ({
  leader,
  onOpenCheckout,
}) => {
  const leaderAmount = leader?.totalAmount || 20000;
  const defaultWinningAmount = leaderAmount + 500;

  const [amount, setAmount] = useState<number>(defaultWinningAmount);

  useEffect(() => {
    if (leader) {
      setAmount(leader.totalAmount + 500);
    }
  }, [leader]);

  const handleStep = (delta: number) => {
    setAmount((prev) => Math.max(500, prev + delta));
  };

  return (
    <section className="mx-auto max-w-lg px-4 py-4 text-center">
      {/* Central Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
        ¿Cuánto pagarías por poner a tu ídolo en el{' '}
        <span className="text-emerald-600 font-black">puesto #1</span> de la historia?
      </h1>

      {/* Leader status line */}
      <p className="mt-2 text-sm text-slate-600">
        El primer lugar lo tiene{' '}
        <strong className="text-slate-900 font-bold">
          {leader ? leader.name : 'Gabriel Hauche'}
        </strong>{' '}
        con{' '}
        <span className="font-bold text-emerald-600">
          ${leader ? leader.totalAmount.toLocaleString('es-AR') : '20.000'}
        </span>
      </p>

      {/* Main Interactive Card (Identical to Lugarcito) */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 text-center">
        {/* Stepper Controller `-   $ 20.500   +` */}
        <div className="my-2 select-none">
          <div className="inline-flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleStep(-500)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
            >
              −
            </button>

            <div className="flex items-center text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              <span className="mr-1.5 text-2xl sm:text-3xl font-bold text-slate-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(100, Number(e.target.value) || 0))}
                className="w-36 text-center font-black bg-transparent text-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStep(500)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
            >
              +
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleStep(500)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              +$500
            </button>
            <button
              type="button"
              onClick={() => handleStep(1000)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              +$1.000
            </button>
            <button
              type="button"
              onClick={() => handleStep(5000)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              +$5.000
            </button>
          </div>
        </div>

        {/* Big Emerald Green Main CTA Button */}
        <button
          type="button"
          onClick={() => onOpenCheckout(amount)}
          className="mt-5 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-4 transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.99] text-center flex items-center justify-center gap-2"
        >
          <span>Llévate el puesto #1 por ${amount.toLocaleString('es-AR')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Trust Badge and Leader Notice */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pago seguro a través de MercadoPago</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            <strong className="text-slate-700">{leader?.name || 'Gabriel Hauche'}</strong> en #1 hace 15 minutos
          </p>
        </div>
      </div>
    </section>
  );
};
