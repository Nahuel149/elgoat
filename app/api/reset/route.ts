import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';

export async function POST() {
  try {
    await resetDatabase();
    return NextResponse.json({ success: true, message: 'Base de datos restablecida a los valores iniciales' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
