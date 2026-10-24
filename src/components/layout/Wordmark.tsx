import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="font-display text-lg font-bold tracking-tight transition-colors hover:text-cyan"
    >
      League<span className="text-magenta">Reviews</span>
    </Link>
  );
}
