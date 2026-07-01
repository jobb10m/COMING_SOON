export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-2 rounded-2xl p-16 text-center">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-ink-muted">
        The API for this module is already built. This screen is a starting point — wire it up to{' '}
        <code className="rounded bg-base/60 px-1.5 py-0.5">/api</code> the same way the Members page does.
      </p>
    </div>
  );
}
