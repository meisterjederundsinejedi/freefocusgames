"use client";

import { Check, Settings as SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSettings } from "@/components/SettingsProvider";
import { CONTRASTS, TEXT_SIZES } from "@/lib/settings";

/** One group of big choice buttons. The chosen one is filled and shows a tick (not colour alone). */
function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; text: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="space-y-3">
      <h3 className="text-[length:var(--text-heading)] font-bold">{label}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Button
              key={option.value}
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
            >
              {selected && <Check aria-hidden="true" />}
              <span>{option.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The settings window, opened from the big "Einstellungen" button in the top bar.
 * It opens over the current page, so a running game is not lost.
 */
export function SettingsDialog() {
  const t = useTranslations("common.settings");
  const { settings, update } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SettingsIcon aria-hidden="true" />
          <span>{t("open")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent showClose={false} className="max-h-[90vh] max-w-xl space-y-2 overflow-y-auto border-2">
        <DialogTitle className="text-[2rem] leading-tight">{t("title")}</DialogTitle>
        <DialogDescription className="text-lg">{t("saved")}</DialogDescription>

        <div className="space-y-8 py-4">
          <Choice
            label={t("textSize.label")}
            value={settings.textSize}
            onChange={(textSize) => update({ textSize })}
            options={TEXT_SIZES.map((value) => ({ value, text: t(`textSize.${value}`) }))}
          />
          <Choice
            label={t("contrast.label")}
            value={settings.contrast}
            onChange={(contrast) => update({ contrast })}
            options={CONTRASTS.map((value) => ({ value, text: t(`contrast.${value}`) }))}
          />
          <Choice
            label={t("sound.label")}
            value={settings.sound ? "on" : "off"}
            onChange={(value) => update({ sound: value === "on" })}
            options={[
              { value: "on", text: t("sound.on") },
              { value: "off", text: t("sound.off") },
            ]}
          />
        </div>

        <DialogClose asChild>
          <Button size="lg" className="w-full">
            {t("done")}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
