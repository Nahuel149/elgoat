'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/types';
import { X, Sparkles, DollarSign, MessageSquare, User, CreditCard, Flame, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayer: Player | null;
  players: Player[];
  onVoteSuccess: (message?: string) => void;
  isMpConfigured?: boolean;
}

const PRESET_AMOUNTS = [
  { amount: 500, label: '$500', desc: 'Para la coca 🥤' },
  { amount: 1000, label: '$1.000', desc: 'Un empujón 🚀' },
  { amount: 2000, label: '$2.000', desc: 'Basta de chamuyo ⚽' },
  { amount: 5000, label: '$5.000', desc: 'Amor incondicional 💙' },
  { amount: 10000, label: '$10.000', desc: 'Salvar al 10 ⭐' },
  { amount: 20000, label: '$20.000', desc: 'Poder Absoluto 👑' },
];

export const VoteModal: React.FC<VoteModalProps> = ({
  isOpen,
  onClose,
  selectedPlayer,
  players,
  onVoteSuccess,
  isMpConfigured = false,
}) => {
  const [playerId, setPlayerId] = useState<string>('');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlayer) {
      setPlayerId(selectedPlayer.id);
    } else if (players.length > 0 && !playerId) {
      setPlayerId(players[0].id);
    }
  }, [selectedPlayer, players]);

  if (!isOpen) return null;

  const currentPlayer = players.find((p) => p.id === playerId) || selectedPlayer || players[0];
  const finalAmount = isCustom ? Number(customAmount) : amount;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Handle Real Mercado Pago Checkout
  const handleMercadoPagoCheckout = async () => {
    setError(null);
    if (!finalAmount || finalAmount < 100) {
      setError('El monto mínimo es de $100 ARS');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          amount: finalAmount,
          donorName: donorName || 'Hincha Anónimo',
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (!data.isMpConfigured) {
          setError(
            'Mercado Pago no tiene credenciales configuradas en el servidor. Podés probar usando el botón "⚡ Simular Voto (Prueba)" aquí abajo.'
          );
        } else {
          setError(data.error || 'Error al iniciar pago con Mercado Pago');
        }
        setIsLoading(false);
        return;
      }

      // Redirect to Mercado Pago checkout
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setIsLoading(false);
    }
  };

  // Handle Instant Simulation / Demo Mode
  const handleSimulateVote = async () => {
    setError(null);
    if (!finalAmount || finalAmount < 100) {
      setError('El monto mínimo es de $100 ARS');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          amount: finalAmount,
          donorName: donorName || 'Hincha Fiel ⚽',
          comment,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        triggerConfetti();
        onVoteSuccess(`¡Voto de $${finalAmount.toLocaleString('es-AR')} registrado para ${currentPlayer.name}!`);
        onClose();
      } else {
        setError(data.error || 'Error al simular voto');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 p-6 sm:p-7 shadow-2xl text-left my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Bancar a tu Jugador</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          Hacé subir a tu ídolo en el ranking
        </h2>

        {error && (
          <div className="mt-4 rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Player Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              Jugador a bancar
            </label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.club}) - ${p.totalAmount.toLocaleString('es-AR')}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              ¿Cuánta plata vas a poner? (ARS)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = !isCustom && amount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setAmount(preset.amount);
                    }}
                    className={`rounded-xl p-2.5 text-center transition-all border ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-white font-black shadow-md'
                        : 'border-zinc-800 bg-zinc-800/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="text-sm font-black">{preset.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{preset.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount input */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                {isCustom ? '← Elegir monto sugerido' : '+ Ingresar otro monto personalizado'}
              </button>

              {isCustom && (
                <div className="mt-2 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Ej: 15000"
                    min="100"
                    className="w-full rounded-xl border border-amber-500/50 bg-zinc-800/90 py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-zinc-400" />
              <span>Tu Nombre / Apodo / Club</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Ej: Hincha de Racing Enfermo, Bostero de Cuna, etc."
              maxLength={40}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Comment / Chicana */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
              <span>Mensaje / Chicana para la tribuna (Opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Hauche es más grande que Pelé porque nunca perdió con el Bayern..."
              maxLength={120}
              rows={2}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 p-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          {/* Main MP Checkout Button */}
          <button
            onClick={handleMercadoPagoCheckout}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm py-3 transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50 active:scale-98"
          >
            <CreditCard className="h-4 w-4" />
            <span>
              {isLoading ? 'Iniciando...' : `Pagar $${finalAmount.toLocaleString('es-AR')} con Mercado Pago`}
            </span>
          </button>

          {/* Simulator / Demo Instant Vote */}
          <button
            onClick={handleSimulateVote}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs py-2.5 transition-all disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>⚡ Simular Voto (Prueba Rápida sin Pagar)</span>
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-zinc-500">
          🔒 Los votos se computan automáticamente en el ranking oficial al instante.
        </p>
      </div>
    </div>
  );
};
