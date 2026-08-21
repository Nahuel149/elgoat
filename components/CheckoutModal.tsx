'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/types';
import { X, ShieldCheck, Sparkles, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount: number;
  initialPlayer: Player | null;
  players: Player[];
  leader: Player | null;
  onVoteSuccess: (message?: string) => void;
  onPlayerPostulated: (player: Player) => void;
  isMpConfigured?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  initialAmount,
  initialPlayer,
  players,
  leader,
  onVoteSuccess,
  onPlayerPostulated,
  isMpConfigured = false,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [club, setClub] = useState('');
  const [comment, setComment] = useState('');
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState<number>(initialAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlayer) {
      setPlayerName(initialPlayer.name);
      setClub(initialPlayer.club || '');
      setComment(initialPlayer.highlightNote || '');
    } else {
      setPlayerName('');
      setClub('');
      setComment('');
    }
    setAmount(initialAmount);
    setError(null);
  }, [initialPlayer, initialAmount, isOpen]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  const handlePay = async (isSimulation = false) => {
    setError(null);
    const finalName = playerName.trim();

    if (!finalName) {
      setError('Ingresá el nombre del jugador que querés postular o bancar');
      return;
    }

    if (!amount || amount < 100) {
      setError('El monto mínimo es de $100 ARS');
      return;
    }

    setIsLoading(true);

    try {
      if (isSimulation) {
        const res = await fetch('/api/checkout/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: finalName,
            playerClub: club.trim() || 'Club Libre',
            playerNote: comment.trim() || undefined,
            amount: Number(amount),
            donorName: donorName.trim() || 'Hincha Apasionado ⚽',
            comment: comment.trim() || undefined,
          }),
        });

        const data = await res.json();
        setIsLoading(false);

        if (data.success) {
          triggerConfetti();
          onVoteSuccess(
            `¡Voto de $${amount.toLocaleString('es-AR')} confirmado para ${finalName}!`
          );
          onClose();
        } else {
          setError(data.error || 'Error al procesar voto');
        }
      } else {
        // Real Mercado Pago preference
        const res = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: finalName,
            playerClub: club.trim() || 'Club Libre',
            playerNote: comment.trim() || undefined,
            amount: Number(amount),
            donorName: donorName.trim() || 'Votante Futbolero',
            comment: comment.trim() || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (!data.isMpConfigured) {
            setError(
              'Mercado Pago todavía no está configurado en .env.local. Podés probar con el botón "⚡ Probar Voto Demo" para ver cómo funciona en vivo.'
            );
          } else {
            setError(data.error || 'Error al iniciar Mercado Pago');
          }
          setIsLoading(false);
          return;
        }

        if (data.initPoint) {
          window.location.href = data.initPoint;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl text-left my-8 border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold mb-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Llevate el puesto #1</span>
        </div>

        <h2 className="text-xl font-black text-slate-900 leading-tight">
          Poné a tu ídolo en el ranking
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Completá los datos y pagá con Mercado Pago para coronarlo en la cima.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-5 space-y-3.5">
          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Nombre del jugador *
            </label>
            <input
              type="text"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Lionel Messi, Gabriel Hauche, Wanchope Ábila..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Club & Country */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Club o Selección
            </label>
            <input
              type="text"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="Ej: Inter Miami / Barcelona / Selección Argentina"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Comment / Chicana */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Tu chicana o frase destacada (Opcional)
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Campeón del Mundo 2022 y 8 Balones de Oro"
              maxLength={90}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4. Tu nombre o apodo (Opcional)
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Ej: Scaloneta de Corazón, Hincha Fiel..."
              maxLength={40}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Amount Box */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 text-center">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Total a pagar por el puesto
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              ${amount.toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => handlePay(false)}
            disabled={isLoading}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.99] disabled:opacity-50 text-center flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>
              {isLoading ? 'Conectando...' : `Pagar $${amount.toLocaleString('es-AR')} con Mercado Pago`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handlePay(true)}
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 transition-all text-center"
          >
            ⚡ Probar Voto Demo (Gratis / Instantáneo)
          </button>
        </div>

        <div className="mt-3 text-center flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Pago protegido a través de MercadoPago</span>
        </div>
      </div>
    </div>
  );
};
