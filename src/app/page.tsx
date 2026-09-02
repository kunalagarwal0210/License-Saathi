// Scaffold placeholder — NOT the real landing page.
// The Landing surface (ticket 05) is designed via its own /impeccable shape
// gate against DESIGN.md before it is built. This page only proves the app is
// live and the design foundation (fonts + tokens) loads.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
        Ahmedabad · micro-licensing
      </span>
      <h1 className="font-signage text-4xl font-bold tracking-tight text-ink">
        LicenseSaathi
      </h1>
      <p className="max-w-sm text-base leading-relaxed text-ink-secondary">
        Your route to a licensed shop — the exact licenses you need, in order,
        each verified and dated.
      </p>
      <p className="mt-10 text-xs text-ink-muted">
        Scaffold placeholder · design system “The Route” is live · v0.1
      </p>
    </main>
  );
}
