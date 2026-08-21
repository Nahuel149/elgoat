import { NextResponse } from 'next/server';
import { isMercadoPagoConfigured } from '@/lib/mercadopago';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      isMpConfigured: isMercadoPagoConfigured(),
      minAmount: 100,
      currency: 'ARS',
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    }
  );
}
