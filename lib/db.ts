import fs from 'fs';
import path from 'path';
import os from 'os';
import { createClient } from 'redis';
import { DatabaseSchema, Player, Vote, LeaderboardStats } from './types';
import { INITIAL_PLAYERS, INITIAL_VOTES } from './seedData';

const TMP_DB_FILE = path.join(os.tmpdir(), 'elgoat_store.json');
const LOCAL_DB_FILE = path.join(process.cwd(), 'data', 'store.json');

declare global {
  // eslint-disable-next-line no-var
  var __elgoat_db__: DatabaseSchema | undefined;
  // eslint-disable-next-line no-var
  var __redis_client__: any | undefined;
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

// Connect to Redis Cloud instance
async function getRedisClient() {
  const redisUrl = (
    process.env.REDIS_URL ||
    process.env.STORAGE_URL ||
    process.env.KV_URL ||
    ''
  ).trim();

  if (!redisUrl || !redisUrl.startsWith('redis')) {
    return null;
  }

  try {
    if (globalThis.__redis_client__ && globalThis.__redis_client__.isOpen) {
      return globalThis.__redis_client__;
    }

    const client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 5000,
      },
    });

    client.on('error', (err) => {
      console.warn('[Redis Error]:', err.message);
    });

    await client.connect();
    globalThis.__redis_client__ = client;
    return client;
  } catch (err: any) {
    console.warn('[Redis Connection Failed]:', err.message);
    return null;
  }
}

// Local fallback loader
function initLocalDb(): DatabaseSchema {
  if (globalThis.__elgoat_db__) {
    return globalThis.__elgoat_db__;
  }

  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const data = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
        globalThis.__elgoat_db__ = parsed;
        return parsed;
      }
    }
  } catch {}

  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.players)) {
        globalThis.__elgoat_db__ = parsed;
        return parsed;
      }
    }
  } catch {}

  const initial = getInitialDb();
  globalThis.__elgoat_db__ = initial;
  return initial;
}

function saveLocalDb(db: DatabaseSchema): void {
  globalThis.__elgoat_db__ = db;
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch {}
  try {
    const dataDir = path.dirname(LOCAL_DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch {}
}

// Main DB loader with Redis Cloud + KV REST + Local fallback
async function getDb(): Promise<DatabaseSchema> {
  // 1. Try Redis Cloud (via REDIS_URL)
  try {
    const redis = await getRedisClient();
    if (redis) {
      const rawData = await redis.get('elgoat_db');
      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
          globalThis.__elgoat_db__ = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Redis Read Error]:', err);
  }

  // 2. Try Upstash / Vercel KV REST API
  const kvUrl = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_REST_API_URL ||
    ''
  ).trim();
  const kvToken = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    ''
  ).trim();

  if (kvUrl && kvToken && kvUrl.startsWith('http')) {
    try {
      const res = await fetch(`${kvUrl}/get/elgoat_db`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed =
            typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
            globalThis.__elgoat_db__ = parsed;
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('[KV REST Read Error]:', err);
    }
  }

  // 3. Fallback to local memory / tmp
  return initLocalDb();
}

async function saveDb(db: DatabaseSchema): Promise<void> {
  saveLocalDb(db);

  // 1. Save to Redis Cloud
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.set('elgoat_db', JSON.stringify(db));
    }
  } catch (err) {
    console.warn('[Redis Save Error]:', err);
  }

  // 2. Save to KV REST API
  const kvUrl = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_REST_API_URL ||
    ''
  ).trim();
  const kvToken = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    ''
  ).trim();

  if (kvUrl && kvToken && kvUrl.startsWith('http')) {
    try {
      await fetch(`${kvUrl}/set/elgoat_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(db),
      });
    } catch (err) {
      console.warn('[KV REST Save Error]:', err);
    }
  }
}

export async function getPlayers(): Promise<Player[]> {
  const db = await getDb();
  return [...db.players].sort((a, b) => {
    if (b.totalAmount !== a.totalAmount) {
      return b.totalAmount - a.totalAmount;
    }
    return b.votesCount - a.votesCount;
  });
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = await getDb();
  return db.players.find((p) => p.id === id) || null;
}

export async function findOrCreatePlayer(params: {
  playerId?: string;
  playerName?: string;
  club?: string;
  highlightNote?: string;
}): Promise<Player> {
  const db = await getDb();

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

  throw new Error('El jugador especificado no es válido');
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  const players = await getPlayers();
  const db = await getDb();

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
  const db = await getDb();
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

  const db = await getDb();
  let dbPlayer = db.players.find((p) => p.id === player.id);
  if (!dbPlayer) {
    db.players.push(player);
    dbPlayer = player;
  }

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

  await saveDb(db);
  return newVote;
}

export async function approveVote(voteId: string, paymentId?: string): Promise<Vote | null> {
  const db = await getDb();
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

  await saveDb(db);
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
  const db = await getDb();

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
  await saveDb(db);
  return newPlayer;
}

export async function resetDatabase(): Promise<void> {
  const initial = getInitialDb();
  await saveDb(initial);
}
