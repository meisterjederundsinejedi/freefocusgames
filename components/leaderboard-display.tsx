"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DEFAULT_LEADERBOARD_MODE } from "@/lib/leaderboard-config";
import { readLocalScores, type LocalScore } from "@/lib/leaderboard";

export type FormatterType = 'ms' | 'sec3' | 'sec4' | 'cps' | 'pts' | 'levels' | 'steps' | 'digits' | 'schulte' | 'percent' | 'wahs' | 'default';
export type LeaderboardDetailsType = 'double-decision';

export interface LeaderboardDisplayProps {
    gameId: string;
    formatterType?: FormatterType;
    mode?: string;
    /** Kept so existing game pages compile; there are no details in the local list. */
    detailsType?: LeaderboardDetailsType;
}

const SHOWN = 5;

/**
 * "Your best results": the personal list of this device, best first.
 * Reads localStorage only; nothing is sent anywhere.
 */
export function LeaderboardDisplay({
    gameId,
    formatterType = 'default',
    mode = DEFAULT_LEADERBOARD_MODE,
}: LeaderboardDisplayProps) {
    const t = useTranslations('common.leaderboard');
    const locale = useLocale();
    const [scores, setScores] = useState<LocalScore[] | null>(null);

    const load = useCallback(() => setScores(readLocalScores(gameId, mode)), [gameId, mode]);

    useEffect(() => {
        load();
        const onUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ gameId?: string; mode?: string }>).detail;
            if (!detail || (detail.gameId === gameId && (detail.mode ?? DEFAULT_LEADERBOARD_MODE) === mode)) {
                load();
            }
        };
        window.addEventListener('leaderboardUpdated', onUpdate);
        return () => window.removeEventListener('leaderboardUpdated', onUpdate);
    }, [gameId, mode, load]);

    const formatScore = useCallback((s: number) => {
        const rounded = Math.round(s);
        switch (formatterType) {
            case 'ms': return `${rounded} ${t('unitMs')}`;
            case 'sec3': return `${(s / 1000).toFixed(3)} ${t('unitSec')}`;
            case 'sec4': return `${(s / 1000).toFixed(4)} ${t('unitSec')}`;
            case 'cps': return `${Number(s.toFixed(1))} ${t('unitCps')}`;
            case 'pts': return `${rounded} ${t('unitPts')}`;
            case 'levels': return t('unitLevel', { score: rounded.toString() });
            case 'digits': return t('unitDigits', { score: Number(s.toFixed(1)).toString() });
            case 'steps': return t('unitSteps', { score: Number(s.toFixed(1)).toString() });
            case 'schulte': return `${(s / 1000).toFixed(1)} ${t('unitSec')}`;
            case 'percent': return `${rounded}${t('unitPercent')}`;
            case 'wahs': return t('unitWahTurns', { score: rounded.toString() });
            default: return rounded.toString();
        }
    }, [formatterType, t]);

    // Before the first read (and on the server) show nothing, so the layout does not jump.
    if (scores === null) return null;

    if (scores.length === 0) {
        return <p className="text-xl">{t('empty')}</p>;
    }

    return (
        <ol className="space-y-3">
            {scores.slice(0, SHOWN).map((entry, index) => (
                <li
                    key={`${entry.at}-${index}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-[var(--radius)] border-2 border-border bg-card px-5 py-3"
                >
                    <span className="text-[length:var(--text-button)] font-bold">
                        {index + 1}. {formatScore(entry.score)}
                        {index === 0 && <span className="ml-3 text-xl">· {t('best')}</span>}
                    </span>
                    <span className="text-lg text-muted-foreground">
                        {new Date(entry.at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </li>
            ))}
        </ol>
    );
}
