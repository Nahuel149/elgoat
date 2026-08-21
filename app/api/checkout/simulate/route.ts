import { NextResponse } from 'next/server';
import { createVote, getLeaderboardStats } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, playerName, playerClub, playerNote, amount, donorName, comment } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'El monto mínimo es de $100 ARS' },
        { status: 400 }
      );
    }

    if (!playerId && !playerName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del jugador es obligatorio' },
        { status: 400 }
      );
    }

    const vote = await createVote({
      playerId,
      playerName,
      playerClub,
      playerNote,
      amount: parsedAmount,
      donorName: donorName || 'Fanático Anónimo',
      comment: comment || undefined,
      isSimulation: true,
    });

    const stats = await getLeaderboardStats();

    return NextResponse.json(
      {
        success: true,
        message: `¡Voto simulado con éxito por $${parsedAmount.toLocaleString('es-AR')} para ${vote.playerName}!`,
        vote,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar voto' },
      { status: 500 }
    );
  }
}
