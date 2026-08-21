export interface Player {
  id: string;
  name: string;
  nickname?: string;
  club?: string;
  country: string;
  photoUrl: string;
  totalAmount: number;
  votesCount: number;
  isMeme?: boolean;
  highlightNote?: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  donorName: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentId?: string;
  preferenceId?: string;
  isSimulation?: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  players: Player[];
  votes: Vote[];
  settings: {
    minimumVoteAmount: number;
    appName: string;
    headline: string;
  };
}

export interface LeaderboardStats {
  totalRaised: number;
  totalVotes: number;
  leaderPlayer: Player | null;
  playersCount: number;
}
