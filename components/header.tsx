"use client";

import { Home } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { SettingsDialog } from "@/components/SettingsDialog";

const LANGUAGE_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "English",
};

/**
 * Top bar shown on every screen.
 * The big Home button is always in the same place (top left), also on the home screen.
 */
export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Button asChild size="lg">
          <Link href="/" aria-label={t("home")}>
            <Home aria-hidden="true" />
            <span>{t("home")}</span>
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <nav aria-label={t("language")} className="flex items-center gap-3">
            <span className="text-muted-foreground">{t("language")}:</span>
            {routing.locales.map((code) => (
              <Button
                key={code}
                variant={code === locale ? "default" : "outline"}
                aria-pressed={code === locale}
                onClick={() => router.replace(pathname, { locale: code })}
              >
                {LANGUAGE_NAMES[code] ?? code}
              </Button>
            ))}
          </nav>
          <SettingsDialog />
        </div>
      </div>
    </header>
  );
}
