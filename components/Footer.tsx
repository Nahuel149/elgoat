'use client';

import React from 'react';
import { Trophy, Heart, Shield, RefreshCw } from 'lucide-react';

interface FooterProps {
  onResetData?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 text-center text-xs text-zinc-500">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>EL GOAT DEFINITIVO</span>
        </div>

        <p className="max-w-md text-zinc-400 text-xs">
          Hecho con pasión futbolera, chicanas sanas y folklore argentino. 
          Integrado con Mercado Pago.
        </p>

        <div className="flex items-center gap-4 text-zinc-400 text-xs flex-wrap justify-center">
          <span>⚡ 100% en tiempo real</span>
          <span>•</span>
          <span>🔒 Pagos procesados por Mercado Pago</span>
          <span>•</span>
          <span>⚽ Sin debates, con billetes</span>
        </div>

        <p className="text-[11px] text-zinc-600">
          © {new Date().getFullYear()} El GOAT de la Historia. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
