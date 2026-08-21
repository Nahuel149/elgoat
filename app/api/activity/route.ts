import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db';

export async function GET() {
  try {
    const activity = await getRecentActivity(30);
    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener actividad' },
      { status: 500 }
    );
  }
}
