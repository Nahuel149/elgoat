'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Player } from '@/lib/types';
import { ShieldCheck, Sparkles, User, MessageSquare, AlertCircle, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BiddingHeroProps {
  players: Player[];
  leader: Player | null;
  selectedPlayerId: string;
  onSelectPlayerId: (id: string) => void;
  onVoteSuccess: (message?: string) => void;
  onPlayerPostulated: (player: Player) => void;
  isMpConfigured?: boolean;
}

export const BiddingHero: React.FC<BiddingHeroProps> = ({
  players,
  leader,
  selectedPlayerId,
  onSelectPlayerId,
  onVoteSuccess,
  onPlayerPostulated,
  isMpConfigured = false,
}) => {
  // Player name search/input state
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [playerClubInput, setPlayerClubInput] = useState('');
  const [playerCommentInput, setPlayerCommentInput] = useState('');
  const [donorNameInput, setDonorNameInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Amount state
  const [amount, setAmount] = useState<number>(20500);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leaderAmount = leader?.totalAmount || 20000;

  // Check if current input matches an existing player
  const matchedPlayer = useMemo(() => {
    if (!playerNameInput.trim()) {
      return players.find((p) => p.id === selectedPlayerId) || players[0];
    }
    return (
      players.find(
        (p) => p.name.toLowerCase() === playerNameInput.trim().toLowerCase()
      ) ||
      players.find((p) =>
        p.name.toLowerCase().includes(playerNameInput.trim().toLowerCase())
      ) ||
      null
    );
  }, [playerNameInput, selectedPlayerId, players]);

  // Sync with selectedPlayerId when it changes from outside (e.g. clicking a card)
  useEffect(() => {
    const p = players.find((x) => x.id === selectedPlayerId);
    if (p) {
      setPlayerNameInput(p.name);
      setPlayerClubInput(p.club || '');
    }
  }, [selectedPlayerId, players]);

  // Calculate amount to reach #1 whenever matched player or leader changes
  useEffect(() => {
    if (!leader) return;

    if (matchedPlayer) {
      if (matchedPlayer.id === leader.id) {
        // Already leader: default to +$1000 to keep the lead
        setAmount(1000);
      } else {
        // Needs difference + 500 to take #1
        const needed = Math.max(500, leader.totalAmount - matchedPlayer.totalAmount + 500);
        setAmount(needed);
      }
    } else {
      // New player with 0: needs leaderAmount + 500 to take #1
      setAmount(leaderAmount + 500);
    }
  }, [matchedPlayer, leader, leaderAmount]);

  const handleStep = (delta: number) => {
    setAmount((prev) => Math.max(500, prev + delta));
  };

  const handleSelectSuggestedPlayer = (p: Player) => {
    onSelectPlayerId(p.id);
    setPlayerNameInput(p.name);
    setPlayerClubInput(p.club || '');
    setShowSuggestions(false);
  };

  const filteredSuggestions = useMemo(() => {
    if (!playerNameInput.trim()) return players.slice(0, 5);
    return players.filter((p) =>
      p.name.toLowerCase().includes(playerNameInput.toLowerCase())
    );
  }, [players, playerNameInput]);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  // Submit vote or postulation
  const handleSubmit = async (isSimulation = false) => {
    setError(null);
    const finalName = playerNameInput.trim();

    if (!finalName) {
      setError('Por favor ingresá el nombre del jugador');
      return;
    }

    if (!amount || amount < 100) {
      setError('El monto mínimo es de $100 ARS');
      return;
    }

    setIsLoading(true);

    try {
      let targetPlayerId = matchedPlayer?.id;

      // If it's a completely new player not in database yet
      if (!matchedPlayer || matchedPlayer.name.toLowerCase() !== finalName.toLowerCase()) {
        const createRes = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: finalName,
            club: playerClubInput.trim() || 'Club Libre',
            highlightNote: playerCommentInput.trim() || undefined,
          }),
        });

        const createData = await createRes.json();
        if (!createRes.ok || !createData.success) {
          setError(createData.error || 'Error al postular jugador');
          setIsLoading(false);
          return;
        }

        targetPlayerId = createData.player.id;
        onPlayerPostulated(createData.player);
      }

      if (!targetPlayerId) {
        setError('No se pudo identificar al jugador');
        setIsLoading(false);
        return;
      }

      if (isSimulation) {
        // Instant simulation
        const res = await fetch('/api/checkout/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: targetPlayerId,
            amount: Number(amount),
            donorName: donorNameInput.trim() || 'Hincha Fiel ⚽',
            comment: playerCommentInput.trim() || undefined,
          }),
        });

        const data = await res.json();
        setIsLoading(false);

        if (data.success) {
          triggerConfetti();
          onVoteSuccess(
            `¡Voto de $${amount.toLocaleString('es-AR')} confirmado para ${finalName}!`
          );
        } else {
          setError(data.error || 'Error al registrar voto');
        }
      } else {
        // Real Mercado Pago checkout
        const res = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: targetPlayerId,
            amount: Number(amount),
            donorName: donorNameInput.trim() || 'Votante Futbolero',
            comment: playerCommentInput.trim() || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (!data.isMpConfigured) {
            setError(
              'Mercado Pago no tiene credenciales en el servidor. Podés probar usando el botón "⚡ Probar Voto Demo" aquí abajo.'
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

  const willTakeNumberOne = matchedPlayer
    ? matchedPlayer.totalAmount + amount > leaderAmount
    : amount > leaderAmount;

  return (
    <section className="mx-auto max-w-lg px-4 py-4 text-center">
      {/* Central Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
        ¿Cuánto pagarías por poner a tu ídolo en el{' '}
        <span className="text-emerald-600 font-black">puesto #1</span> de la historia?
      </h1>

      {/* Leader info line */}
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

      {/* Main interactive Bidding Card */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60 text-left">
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Unified Player Input (Choose or Postulate) */}
        <div className="mb-4 relative">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ¿A qué jugador querés poner en el ranking?
          </label>
          <div className="relative">
            <input
              type="text"
              value={playerNameInput}
              onChange={(e) => {
                setPlayerNameInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Escribí cualquier jugador (Messi, Maradona, Hauche, etc.)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <Search className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* Autocomplete / Dropdown list */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">
                Sugerencias o hacé clic para elegir:
              </div>
              {filteredSuggestions.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSuggestedPlayer(p)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">
                      #{idx + 1} {p.name}
                    </span>
                    <span className="text-[11px] text-slate-400">({p.club})</span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    ${p.totalAmount.toLocaleString('es-AR')}
                  </span>
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1 px-3 py-1 text-[11px] text-slate-500">
                ✍️ O escribí un nombre nuevo para postularlo automáticamente
              </div>
            </div>
          )}
        </div>

        {/* Details: Club and Comment */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Club / Selección (Opcional)
            </label>
            <input
              type="text"
              value={playerClubInput}
              onChange={(e) => setPlayerClubInput(e.target.value)}
              placeholder="Ej: Barcelona, Racing, Boca..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Tu apodo o chicana (Opcional)
            </label>
            <input
              type="text"
              value={playerCommentInput}
              onChange={(e) => setPlayerCommentInput(e.target.value)}
              placeholder="Ej: Campeón del Mundo 2022..."
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Stepper Controller `-   $ 21.500   +` */}
        <div className="my-5 text-center">
          <div className="inline-flex items-center justify-center gap-4 select-none">
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
          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleStep(500)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
            >
              +$500
            </button>
            <button
              type="button"
              onClick={() => handleStep(1000)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
            >
              +$1.000
            </button>
            <button
              type="button"
              onClick={() => handleStep(5000)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
            >
              +$5.000
            </button>
          </div>
        </div>

        {/* Big Emerald Green Main CTA Button */}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isLoading}
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.99] disabled:opacity-50 text-center flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Procesando...</span>
          ) : willTakeNumberOne ? (
            <span>Llevate el puesto #1 por ${amount.toLocaleString('es-AR')}</span>
          ) : (
            <span>Bancar a {playerNameInput || 'tu jugador'} por ${amount.toLocaleString('es-AR')}</span>
          )}
        </button>

        {/* Demo Test Simulation Button */}
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
          className="mt-2 w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 transition-all"
        >
          ⚡ Probar Voto Demo (Gratis / Instantáneo)
        </button>

        {/* Trust Badge and Leader Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center space-y-1">
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
