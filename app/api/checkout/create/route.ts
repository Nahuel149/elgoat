import { NextResponse } from 'next/server';
import { getPlayerById, createVote } from '@/lib/db';
import { createMercadoPagoPreference, isMercadoPagoConfigured } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, amount, donorName, comment } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'El monto mínimo de votación es de $100 ARS' },
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

    // Determine robust host baseUrl for Vercel, custom domain or local
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
    const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const protoHeader = request.headers.get('x-forwarded-proto') || (hostHeader?.includes('localhost') ? 'http' : 'https');

    const baseUrl = (configuredUrl && configuredUrl.startsWith('http'))
      ? configuredUrl
      : (hostHeader ? `${protoHeader}://${hostHeader}` : (vercelUrl || 'http://localhost:3000'));

    // Create the vote in database first
    const vote = await createVote({
      playerId: player.id,
      amount: parsedAmount,
      donorName: donorName || 'Anónimo',
      comment: comment || '',
      isSimulation: false,
    });

    if (!isMercadoPagoConfigured) {
      return NextResponse.json({
        success: false,
        isMpConfigured: false,
        error:
          'Mercado Pago no está configurado (falta MP_ACCESS_TOKEN). Podés usar el botón "⚡ Probar Voto Demo" para probar la app.',
        voteId: vote.id,
      });
    }

    const preference = await createMercadoPagoPreference({
      voteId: vote.id,
      playerId: player.id,
      playerName: player.name,
      amount: parsedAmount,
      donorName: donorName || 'Anónimo',
      comment: comment || '',
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      voteId: vote.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout preference:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al iniciar el pago con Mercado Pago' },
      { status: 500 }
    );
  }
}
