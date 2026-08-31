export default function PlayerLoading() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div className="h-20 animate-pulse rounded-lg bg-neutral-100" />
      <div className="h-16 animate-pulse rounded-lg bg-neutral-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-neutral-100"
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-lg bg-neutral-100"
          />
        ))}
      </div>
    </main>
  );
}
