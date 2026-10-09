import { compareScores, DEFAULT_LEADERBOARD_MODE } from "@/lib/leaderboard-config";

/**
 * Personal results, stored only on this device (localStorage).
 * Nothing is sent anywhere. Key is built from the game ID, never from file
 * names, so replacing a game's files keeps the results (see update-workflow.md).
 */
export interface LocalScore {
    score: number;
    /** ISO date string */
    at: string;
}

export interface LeaderboardSubmissionOptions {
    mode?: string;
    /** Accepted so existing games keep compiling; not stored. */
    details?: Record<string, boolean | number | string | null | undefined>;
}

const MAX_KEPT = 20;

function storageKey(gameId: string, mode: string) {
    return `mom-games:${gameId}:scores:${mode}`;
}

/** Results of one game and mode, best first. Never throws. */
export function readLocalScores(
    gameId: string,
    mode: string = DEFAULT_LEADERBOARD_MODE
): LocalScore[] {
    try {
        const raw = window.localStorage.getItem(storageKey(gameId, mode));
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(
                (entry): entry is LocalScore =>
                    typeof entry?.score === "number" &&
                    Number.isFinite(entry.score) &&
                    typeof entry?.at === "string"
            )
            .sort((a, b) => compareScores(gameId, a.score, b.score));
    } catch {
        return [];
    }
}

/** Remembers a finished round. Same name and signature as the old online version. */
export async function submitScoreToLeaderboard(
    gameId: string,
    score: number,
    options: LeaderboardSubmissionOptions = {}
) {
    try {
        if (!Number.isFinite(score)) return;
        const mode = options.mode ?? DEFAULT_LEADERBOARD_MODE;
        const scores = readLocalScores(gameId, mode);
        scores.push({ score, at: new Date().toISOString() });
        scores.sort((a, b) => compareScores(gameId, a.score, b.score));
        window.localStorage.setItem(
            storageKey(gameId, mode),
            JSON.stringify(scores.slice(0, MAX_KEPT))
        );
        window.dispatchEvent(
            new CustomEvent("leaderboardUpdated", { detail: { gameId, mode } })
        );
    } catch {
        // Storage can be blocked (private window). Playing must never break because of it.
    }
}
