"use client";

import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";

/** Compact search in the header, hidden on the home page where the hero has its own. */
export function HeaderSearch() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="min-w-0 flex-1 sm:max-w-xs">
      <SearchBar compact />
    </div>
  );
}
