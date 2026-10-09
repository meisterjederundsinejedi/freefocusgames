import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getEnabledGames, pick } from "@/lib/registry";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const games = getEnabledGames();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-[2.2rem] font-bold">{t("title")}</h1>
        <p className="max-w-3xl text-xl">{t("intro")}</p>
      </section>

      <section aria-labelledby="games-heading" className="space-y-6">
        <h2 id="games-heading" className="text-[length:var(--text-heading)] font-bold">
          {t("gamesHeading")}
        </h2>
        <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <li key={game.id}>
              <Link
                href={game.path}
                className="block h-full overflow-hidden rounded-[var(--radius)] border-2 border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  <Image
                    src={game.thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-[length:var(--text-heading)] font-bold">
                    {pick(game.title, locale)}
                  </h3>
                  <p className="text-lg">{pick(game.description, locale)}</p>
                  <span className="btn-big mt-2 inline-flex items-center bg-primary text-primary-foreground">
                    {t("play")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
