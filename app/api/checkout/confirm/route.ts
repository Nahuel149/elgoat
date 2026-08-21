import { NextResponse } from 'next/server';
import { approveVote } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { voteId, paymentId } = body;

    if (!voteId) {
      return NextResponse.json(
        { success: false, error: 'voteId es requerido' },
        { status: 400 }
      );
    }

    const vote = await approveVote(voteId, paymentId);
    if (!vote) {
      return NextResponse.json(
        { success: false, error: 'Voto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vote,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al confirmar voto' },
      { status: 500 }
    );
  }
}
