'use client';

import React, { useState } from 'react';
import { X, PlusCircle, User, Shield, Globe, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Player } from '@/lib/types';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerAdded: (player: Player) => void;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  onClose,
  onPlayerAdded,
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [club, setClub] = useState('');
  const [country, setCountry] = useState('🇦🇷 Argentina');
  const [photoUrl, setPhotoUrl] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del jugador es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          club: club.trim() || 'Club Libre',
          country: country.trim() || '🇦🇷 Argentina',
          photoUrl: photoUrl.trim() || undefined,
          highlightNote: highlightNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success && data.player) {
        onPlayerAdded(data.player);
        onClose();
      } else {
        setError(data.error || 'Error al postular jugador');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl text-left my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <PlusCircle className="h-4 w-4" />
          <span>Postulación Popular</span>
        </div>
        <h2 className="text-xl font-black text-white mt-1">
          Postular un Nuevo Candidato
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Agregá a cualquier jugador histórico, ídolo de tu club o meme del fútbol argentino.
        </p>

        {error && (
          <div className="mt-3 rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Wanchope Ábila, Enzo Pérez, Zinedine Zidane"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Apodo / Alias
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej: El Tanque, La Brujita"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Club Principal
              </label>
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Ej: Huracán / Colón"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              País / Bandera
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Ej: 🇦🇷 Argentina, 🇺🇾 Uruguay, 🇧🇷 Brasil"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              URL de Foto (Opcional)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Chicana / Hito destacado (Opcional)
            </label>
            <input
              type="text"
              value={highlightNote}
              onChange={(e) => setHighlightNote(e.target.value)}
              placeholder="Ej: El único tipo que metió un gol con la nuca"
              maxLength={80}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs py-3 transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? 'Postulando...' : 'Postular y Dejar Listo para Votar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
