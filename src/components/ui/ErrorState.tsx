"use client";

import { Button } from "./Button";

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-widest text-magenta uppercase">
        Error
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {title}
      </h1>
      <p className="text-text-dim">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          Reintentar
        </Button>
      )}
    </main>
  );
}
