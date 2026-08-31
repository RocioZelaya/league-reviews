export type AccountDto = {
  puuid: string;
  gameName: string;
  tagLine: string;
};

export type LeagueEntryDto = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type MatchParticipantDto = {
  puuid: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  teamPosition: string;
};

export type MatchDto = {
  metadata: {
    matchId: string;
  };
  info: {
    gameDuration: number;
    gameEndTimestamp: number;
    participants: MatchParticipantDto[];
  };
};

export type MatchSummary = {
  matchId: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  durationSeconds: number;
  playedAt: number;
  role: string;
};

export type SoloQueueRank = {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type ResolvedRiotAccount = {
  puuid: string;
  gameName: string;
  tagLine: string;
  soloQueueRank: SoloQueueRank | null;
  matches: MatchSummary[];
};
