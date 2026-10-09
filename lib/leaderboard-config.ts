export type LeaderboardDirection = "ASC" | "DESC";

export interface LeaderboardSortConfig {
  primary: LeaderboardDirection;
  target?: number;
}

export const DEFAULT_LEADERBOARD_MODE = "standard";
export const RANKED_LEADERBOARD_MODE = "ranked";

export const LEADERBOARD_GAME_CONFIG: Record<string, LeaderboardSortConfig> = {
  "reaction-time": { primary: "ASC" },
  "memory-matching-game": { primary: "ASC" },
  "stroop-effect-test": { primary: "ASC" },
  "challenge10Seconds": { primary: "ASC", target: 10_000 },
  "frog-memory-leap": { primary: "DESC" },
  "fish-trace": { primary: "DESC" },
  "digit-span-test": { primary: "DESC" },
  "trail-making-test": { primary: "ASC" },
  "block-memory-challenge": { primary: "DESC" },
  "schulte-table": { primary: "ASC" },
  "rotating-schulte-table": { primary: "ASC" },
  "double-decision": { primary: "DESC" },
  "bamboo-cicada": { primary: "DESC" },
};

export function getLeaderboardSortConfig(gameId: string): LeaderboardSortConfig {
  return LEADERBOARD_GAME_CONFIG[gameId] || { primary: "DESC" };
}

export function hasTargetScore(gameId: string) {
  return typeof getLeaderboardSortConfig(gameId).target === "number";
}

export function isHigherScoreBetter(gameId: string) {
  return getLeaderboardSortConfig(gameId).primary === "DESC";
}

/** Value used to rank a score: distance to the target if the game has one, else the score itself. */
function rankValue(gameId: string, score: number) {
  const { target } = getLeaderboardSortConfig(gameId);
  return typeof target === "number" ? Math.abs(score - target) : score;
}

/** Negative if `left` is the better result, positive if `right` is, 0 if equal. */
export function compareScores(gameId: string, left: number, right: number) {
  const l = rankValue(gameId, left);
  const r = rankValue(gameId, right);
  if (l === r) return 0;
  return isHigherScoreBetter(gameId) ? r - l : l - r;
}
