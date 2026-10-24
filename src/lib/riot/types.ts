import { z } from "zod";
import { platformSchema } from "./regions";

// Only the fields the app consumes are declared; Riot sends many more and
// zod strips the rest.

export const accountDtoSchema = z.object({
  puuid: z.string(),
  gameName: z.string(),
  tagLine: z.string(),
});
export type AccountDto = z.infer<typeof accountDtoSchema>;

export const activeShardDtoSchema = z.object({
  puuid: z.string(),
  game: z.string(),
  region: platformSchema,
});

export const leagueEntryDtoSchema = z.object({
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number(),
  wins: z.number(),
  losses: z.number(),
});
export const leagueEntriesSchema = z.array(leagueEntryDtoSchema);
export type LeagueEntryDto = z.infer<typeof leagueEntryDtoSchema>;

export const matchIdsSchema = z.array(z.string());

export const matchParticipantDtoSchema = z.object({
  puuid: z.string(),
  teamId: z.number(),
  championName: z.string(),
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  win: z.boolean(),
  teamPosition: z.string(),
});

export const matchDtoSchema = z.object({
  metadata: z.object({
    matchId: z.string(),
    participants: z.array(z.string()),
  }),
  info: z.object({
    gameDuration: z.number(),
    gameEndTimestamp: z.number(),
    queueId: z.number(),
    participants: z.array(matchParticipantDtoSchema),
  }),
});
export type MatchDto = z.infer<typeof matchDtoSchema>;

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

export type ChampionStat = {
  championName: string;
  games: number;
  winrate: number;
};

export type StaleSections = {
  stats: boolean;
  matches: boolean;
};
