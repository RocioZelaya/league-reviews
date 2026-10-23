import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
};

export function Card({ raised = false, className = "", ...props }: CardProps) {
  const surface = raised ? "bg-ink-raised" : "bg-ink";
  return (
    <div
      className={`rounded-xl border border-line ${surface} ${className}`}
      {...props}
    />
  );
}
