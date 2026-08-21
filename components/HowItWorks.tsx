'use client';

import React from 'react';
import { DollarSign, Trophy, Flame, ShieldCheck, Share2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Trophy,
      title: '1. Elegí a tu Ídolo',
      desc: 'Buscá a Messi, Diego, Román o postulá a la gloria o meme de tu club.',
      badge: 'Paso 1',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
    },
    {
      icon: DollarSign,
      title: '2. Bancalo con Guita',
      desc: 'Poné desde $500 ARS con Mercado Pago. Las palabras sobran cuando hablan los billetes.',
      badge: 'Paso 2',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: Flame,
      title: '3. Hacelo Subir en Vivo',
      desc: 'El ranking se recalcula al instante. El que más plata junta se queda con la corona del GOAT.',
      badge: 'Paso 3',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    },
    {
      icon: Share2,
      title: '4. Generá Indignación',
      desc: 'Compartí el ranking en Twitter/WhatsApp para que los rivales sufran y salgan a bancar.',
      badge: 'Paso 4',
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-black uppercase tracking-wider text-amber-400">
          Reglas del Juego
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
          ¿Cómo funciona el ranking del GOAT?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl mx-auto">
          Un experimento social y futbolero donde el amor por los colores se mide en pesos contantes y sonantes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border bg-gradient-to-b ${step.color} p-5 backdrop-blur-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-zinc-950/60 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-950/80 text-zinc-300">
                    {step.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-black text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
