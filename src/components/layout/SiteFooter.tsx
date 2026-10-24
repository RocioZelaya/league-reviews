import type { Dictionary } from "@/lib/i18n/dictionary";

type SiteFooterProps = {
  dictionary: Dictionary;
};

export function SiteFooter({ dictionary }: SiteFooterProps) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-xs text-text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>{dictionary.footer.tagline}</p>
        <p>{dictionary.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
