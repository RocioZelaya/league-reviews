import { Wordmark } from "./Wordmark";
import { HeaderSearch } from "./HeaderSearch";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-void/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="shrink-0">
          <Wordmark />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <HeaderSearch />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
