import { NextResponse } from 'next/server';
import { Payment } from 'mercadopago';
import { getMercadoPagoClient } from '@/lib/mercadopago';
import { approveVote } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let topic = searchParams.get('topic') || searchParams.get('type');
    let paymentId = searchParams.get('id') || searchParams.get('data.id');

    // Parse json body if present
    try {
      const body = await request.json();
      if (body?.type === 'payment' || body?.action?.includes('payment')) {
        topic = 'payment';
        paymentId = body?.data?.id || paymentId;
      }
    } catch {
      // Body may be empty or form-data
    }

    const client = getMercadoPagoClient();

    if (topic === 'payment' && paymentId && client) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData && paymentData.status === 'approved') {
        const voteId = paymentData.external_reference;
        if (voteId) {
          await approveVote(voteId, String(paymentId));
          console.log(`[Mercado Pago Webhook] Voto ${voteId} aprobado con pago ID ${paymentId}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Mercado Pago Webhook Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Mercado Pago Webhook Active' });
}
