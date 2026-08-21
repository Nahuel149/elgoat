import { NextResponse } from 'next/server';
import { getPlayerById, createVote, getLeaderboardStats } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, amount, donorName, comment } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'El monto mínimo es de $100 ARS' },
        { status: 400 }
      );
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'El jugador seleccionado no existe' },
        { status: 404 }
      );
    }

    const vote = await createVote({
      playerId: player.id,
      amount: parsedAmount,
      donorName: donorName || 'Fanático Anónimo',
      comment: comment || undefined,
      isSimulation: true,
    });

    const stats = await getLeaderboardStats();

    return NextResponse.json({
      success: true,
      message: `¡Voto simulado con éxito por $${parsedAmount.toLocaleString('es-AR')} para ${player.name}!`,
      vote,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al simular voto' },
      { status: 500 }
    );
  }
}
