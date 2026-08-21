'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Player, LeaderboardStats, Vote } from '@/lib/types';
import { Header } from '@/components/Header';
import { BiddingHero } from '@/components/BiddingHero';
import { PlayerListCards } from '@/components/PlayerListCards';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ShareBar } from '@/components/ShareBar';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

function AppContent() {
  const searchParams = useSearchParams();

  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalRaised: 0,
    totalVotes: 0,
    leaderPlayer: null,
    playersCount: 0,
  });
  const [isMpConfigured, setIsMpConfigured] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState<number>(20500);
  const [checkoutPlayer, setCheckoutPlayer] = useState<Player | null>(null);

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const [playersRes, configRes] = await Promise.all([
        fetch(`/api/players?_t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/config?_t=${timestamp}`, { cache: 'no-store' }),
      ]);

      const playersData = await playersRes.json();
      const configData = await configRes.json();

      if (playersData.success) {
        setPlayers(playersData.players);
        setStats(playersData.stats);
      }

      if (configData) {
        setIsMpConfigured(Boolean(configData.isMpConfigured));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Mercado Pago return redirect
  useEffect(() => {
    const status = searchParams.get('status');
    const voteId = searchParams.get('voteId');
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const playerName = searchParams.get('player');
    const amount = searchParams.get('amount');

    if (status === 'approved' && voteId) {
      fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteId, paymentId: paymentId || undefined }),
      }).then(() => {
        fetchData();
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } catch {}
        setToastMessage(
          `¡Pago confirmado con Mercado Pago! Sumaste $${Number(amount || 0).toLocaleString('es-AR')} para ${playerName || 'tu ídolo'}.`
        );
      });
    }
  }, [searchParams]);

  // Open Checkout for general #1 postulation
  const handleOpenGeneralCheckout = (amount: number) => {
    setCheckoutAmount(amount);
    setCheckoutPlayer(null);
    setIsCheckoutOpen(true);
  };

  // Open Checkout for a specific player card
  const handleSelectPlayerFromCard = (player: Player) => {
    const leaderAmount = stats.leaderPlayer?.totalAmount || 20000;
    const needed =
      player.id === stats.leaderPlayer?.id
        ? 1000
        : Math.max(500, leaderAmount - player.totalAmount + 500);

    setCheckoutAmount(needed);
    setCheckoutPlayer(player);
    setIsCheckoutOpen(true);
  };

  const handleVoteSuccess = (msg?: string) => {
    fetchData();
    if (msg) {
      setToastMessage(msg);
    }
  };

  const handlePlayerPostulated = (newPlayer: Player) => {
    fetchData();
    setToastMessage(`¡${newPlayer.name} fue postulado con éxito!`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl shadow-emerald-500/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-slate-900">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Single-Column Container */}
      <div className="mx-auto max-w-xl">
        {/* Header minimal */}
        <Header totalVotes={stats.totalVotes} />

        {/* Central Bidding Card (Lugarcito Style) */}
        <BiddingHero
          leader={stats.leaderPlayer}
          onOpenCheckout={handleOpenGeneralCheckout}
        />

        {/* Ranked Single-Column Cards */}
        <PlayerListCards
          players={players}
          onSelectPlayer={handleSelectPlayerFromCard}
          onOpenNewPlayerTab={() => handleOpenGeneralCheckout(stats.leaderPlayer ? stats.leaderPlayer.totalAmount + 500 : 20500)}
        />

        {/* Subtle footer */}
        <footer className="mt-8 text-center text-xs text-slate-400 pb-12">
          <p>
            elgoat. • creado para Argentina 🇦🇷 • integrado con MercadoPago
          </p>
        </footer>
      </div>

      {/* Checkout Modal Step-by-Step */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialAmount={checkoutAmount}
        initialPlayer={checkoutPlayer}
        players={players}
        leader={stats.leaderPlayer}
        onVoteSuccess={handleVoteSuccess}
        onPlayerPostulated={handlePlayerPostulated}
        isMpConfigured={isMpConfigured}
      />

      {/* Sticky bottom share pill */}
      <ShareBar leader={stats.leaderPlayer} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-emerald-600 font-bold text-sm">
          Cargando elgoat...
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
