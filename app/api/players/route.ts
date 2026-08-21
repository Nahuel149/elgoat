import { NextResponse } from 'next/server';
import { getPlayers, getLeaderboardStats, addCustomPlayer } from '@/lib/db';

export async function GET() {
  try {
    const players = await getPlayers();
    const stats = await getLeaderboardStats();

    return NextResponse.json({
      success: true,
      players,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener jugadores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nickname, club, country, photoUrl, highlightNote } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'El nombre del jugador es obligatorio' },
        { status: 400 }
      );
    }

    const newPlayer = await addCustomPlayer({
      name,
      nickname,
      club,
      country,
      photoUrl,
      highlightNote,
    });

    return NextResponse.json({
      success: true,
      player: newPlayer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al agregar jugador' },
      { status: 500 }
    );
  }
}
