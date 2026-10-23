import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function SectionHeading({
  title,
  eyebrow,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="font-mono text-xs tracking-widest text-cyan uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-bold tracking-tight">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
