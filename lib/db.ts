import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Player, Vote, LeaderboardStats } from './types';
import { INITIAL_PLAYERS, INITIAL_VOTES } from './seedData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure directory and db file exist
function initDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        players: INITIAL_PLAYERS,
        votes: INITIAL_VOTES,
        settings: {
          minimumVoteAmount: 500,
          appName: 'El GOAT de la Historia',
          headline: '¿Quién es el mejor de la historia del fútbol? La única votación donde mandan los billetes.',
        },
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database file, returning in-memory initial state:', error);
    return {
      players: INITIAL_PLAYERS,
      votes: INITIAL_VOTES,
      settings: {
        minimumVoteAmount: 500,
        appName: 'El GOAT de la Historia',
        headline: '¿Quién es el mejor de la historia del fútbol?',
      },
    };
  }
}

function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export async function getPlayers(): Promise<Player[]> {
  const db = initDb();
  return [...db.players].sort((a, b) => {
    if (b.totalAmount !== a.totalAmount) {
      return b.totalAmount - a.totalAmount;
    }
    return b.votesCount - a.votesCount;
  });
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = initDb();
  return db.players.find((p) => p.id === id) || null;
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  const players = await getPlayers();
  const db = initDb();
  
  const totalRaised = players.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalVotes = db.votes.filter((v) => v.status === 'approved').length;

  return {
    totalRaised,
    totalVotes,
    leaderPlayer: players.length > 0 ? players[0] : null,
    playersCount: players.length,
  };
}

export async function getRecentActivity(limit = 20): Promise<Vote[]> {
  const db = initDb();
  return db.votes
    .filter((v) => v.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function createVote(params: {
  playerId: string;
  amount: number;
  donorName: string;
  comment?: string;
  preferenceId?: string;
  isSimulation?: boolean;
}): Promise<Vote> {
  const db = initDb();
  const player = db.players.find((p) => p.id === params.playerId);

  if (!player) {
    throw new Error('Jugador no encontrado');
  }

  const newVote: Vote = {
    id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    playerId: player.id,
    playerName: player.name,
    amount: params.amount,
    donorName: params.donorName.trim() || 'Anónimo',
    comment: params.comment?.trim() || undefined,
    status: params.isSimulation ? 'approved' : 'pending',
    preferenceId: params.preferenceId,
    isSimulation: params.isSimulation || false,
    createdAt: new Date().toISOString(),
  };

  db.votes.unshift(newVote);

  if (newVote.status === 'approved') {
    player.totalAmount += newVote.amount;
    player.votesCount += 1;
  }

  saveDb(db);
  return newVote;
}

export async function approveVote(voteId: string, paymentId?: string): Promise<Vote | null> {
  const db = initDb();
  const vote = db.votes.find((v) => v.id === voteId || v.preferenceId === voteId);

  if (!vote) {
    return null;
  }

  if (vote.status === 'approved') {
    return vote; // Already approved
  }

  vote.status = 'approved';
  if (paymentId) vote.paymentId = paymentId;

  const player = db.players.find((p) => p.id === vote.playerId);
  if (player) {
    player.totalAmount += vote.amount;
    player.votesCount += 1;
  }

  saveDb(db);
  return vote;
}

export async function addCustomPlayer(data: {
  name: string;
  nickname?: string;
  club?: string;
  country?: string;
  photoUrl?: string;
  highlightNote?: string;
}): Promise<Player> {
  const db = initDb();
  
  // Clean id from name
  const baseId = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-');
  
  const id = `${baseId}-${Math.random().toString(36).substring(2, 5)}`;

  const newPlayer: Player = {
    id,
    name: data.name.trim(),
    nickname: data.nickname?.trim(),
    club: data.club?.trim() || 'Libre / Selección',
    country: data.country?.trim() || '🇦🇷 Argentina',
    photoUrl:
      data.photoUrl?.trim() ||
      `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80`,
    totalAmount: 0,
    votesCount: 0,
    highlightNote: data.highlightNote?.trim() || '⭐ Postulado por la comunidad',
    createdAt: new Date().toISOString(),
  };

  db.players.push(newPlayer);
  saveDb(db);
  return newPlayer;
}

export async function resetDatabase(): Promise<void> {
  const initialDb: DatabaseSchema = {
    players: INITIAL_PLAYERS,
    votes: INITIAL_VOTES,
    settings: {
      minimumVoteAmount: 500,
      appName: 'El GOAT de la Historia',
      headline: '¿Quién es el mejor de la historia del fútbol?',
    },
  };
  saveDb(initialDb);
}
