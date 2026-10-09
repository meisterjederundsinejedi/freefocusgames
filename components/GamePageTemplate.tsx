import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * The shared game shell. Every game page is shown through this component so that
 * all games look and behave the same:
 *
 *   [ top bar with the big Home button ]   <- comes from the page layout
 *   Title + one-line subtitle
 *   "How to play" (short, always the same place)
 *   The game itself
 *
 * Many of the props below come from the original collection (SEO text, FAQ,
 * benefit lists, leaderboards, sharing). The shell deliberately ignores them.
 * They stay in the type only so existing game pages keep compiling; remove
 * them from a game page when that game is adapted.
 */
interface GamePageTemplateProps {
    gameBackground?: string;
    gameId: string;
    title: string;
    subtitle: string;
    description?: React.ReactNode;
    gameComponent: React.ReactNode;
    howToPlay: React.ReactNode;
    // Ignored by the shell (kept so older game pages still compile):
    additionalContent?: React.ReactNode;
    shareActions?: React.ReactNode;
    benefits?: unknown;
    benefitsTitle?: React.ReactNode;
    science?: unknown;
    faq?: unknown;
    relatedGames?: string[];
    hasLeaderboard?: boolean;
    leaderboardTitle?: React.ReactNode;
    leaderboardFormatterType?: unknown;
    leaderboardDetailsType?: unknown;
    leaderboardMode?: string;
    leaderboardIntro?: React.ReactNode;
    leaderboardComponent?: React.ReactNode;
    structuredData?: unknown;
}

export function GamePageTemplate({
    gameBackground,
    title,
    subtitle,
    description,
    gameComponent,
    howToPlay,
}: GamePageTemplateProps) {
    const t = useTranslations("games.template");

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-[2.2rem] font-bold">{title}</h1>
                <p className="max-w-3xl text-xl">{subtitle}</p>
                {description && (
                    <div className="max-w-3xl text-lg text-muted-foreground">{description}</div>
                )}
            </header>

            {/* Same place and same wording in every game. Open by default, can be folded away. */}
            <details open className="rounded-[var(--radius)] border-2 border-border bg-card p-5">
                <summary className="cursor-pointer text-[length:var(--text-heading)] font-bold">
                    {t("howToPlay")}
                </summary>
                <div className="mt-3 space-y-3 text-lg">{howToPlay}</div>
            </details>

            <section
                aria-label={title}
                className={cn(
                    "rounded-[var(--radius)] border-2 border-border p-3 md:p-5",
                    gameBackground
                )}
            >
                {gameComponent}
            </section>
        </div>
    );
}
