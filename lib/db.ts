import fs from 'fs';
import path from 'path';
import os from 'os';
import { DatabaseSchema, Player, Vote, LeaderboardStats } from './types';
import { INITIAL_PLAYERS, INITIAL_VOTES } from './seedData';

// In Vercel / serverless, process.cwd() is read-only. We use os.tmpdir() + in-memory global state
const TMP_DB_FILE = path.join(os.tmpdir(), 'elgoat_store.json');
const LOCAL_DB_FILE = path.join(process.cwd(), 'data', 'store.json');

declare global {
  // eslint-disable-next-line no-var
  var __elgoat_db__: DatabaseSchema | undefined;
}

function getInitialDb(): DatabaseSchema {
  return {
    players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
    votes: JSON.parse(JSON.stringify(INITIAL_VOTES)),
    settings: {
      minimumVoteAmount: 500,
      appName: 'El GOAT de la Historia',
      headline: '¿Quién es el mejor de la historia del fútbol?',
    },
  };
}

// Ensure in-memory and persistent DB is loaded
function initDb(): DatabaseSchema {
  if (globalThis.__elgoat_db__) {
    return globalThis.__elgoat_db__;
  }

  // Try reading from TMP first (writable on Vercel)
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const data = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
        globalThis.__elgoat_db__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read from tmp db file:', err);
  }

  // Try reading from local store.json
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.players)) {
        globalThis.__elgoat_db__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read from local db file:', err);
  }

  // Fallback to initial seeds
  const initial = getInitialDb();
  globalThis.__elgoat_db__ = initial;
  saveDb(initial);
  return initial;
}

function saveDb(db: DatabaseSchema): void {
  globalThis.__elgoat_db__ = db;

  // Attempt to write to /tmp on serverless or local data dir
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // Ignore tmp write errors if sandbox restricted
  }

  try {
    const dataDir = path.dirname(LOCAL_DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // Ignore read-only errors on serverless Vercel
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

export async function findOrCreatePlayer(params: {
  playerId?: string;
  playerName?: string;
  club?: string;
  highlightNote?: string;
}): Promise<Player> {
  const db = initDb();

  if (params.playerId) {
    const existing = db.players.find((p) => p.id === params.playerId);
    if (existing) return existing;
  }

  const name = params.playerName?.trim();
  if (name) {
    const existingByName = db.players.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (existingByName) return existingByName;

    return await addCustomPlayer({
      name,
      club: params.club,
      highlightNote: params.highlightNote,
    });
  }

  throw new Error('El jugador especificado no existe o no tiene nombre válido');
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
  playerId?: string;
  playerName?: string;
  playerClub?: string;
  playerNote?: string;
  amount: number;
  donorName: string;
  comment?: string;
  preferenceId?: string;
  isSimulation?: boolean;
}): Promise<Vote> {
  const player = await findOrCreatePlayer({
    playerId: params.playerId,
    playerName: params.playerName,
    club: params.playerClub,
    highlightNote: params.playerNote,
  });

  const db = initDb();
  const dbPlayer = db.players.find((p) => p.id === player.id) || player;

  const newVote: Vote = {
    id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    playerId: dbPlayer.id,
    playerName: dbPlayer.name,
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
    dbPlayer.totalAmount += newVote.amount;
    dbPlayer.votesCount += 1;
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
    return vote;
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
  const initial = getInitialDb();
  saveDb(initial);
}
