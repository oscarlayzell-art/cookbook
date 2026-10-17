/**
 * Placeholder brand mark: a cloud wearing a halo, with the "halo" wordmark.
 * Swap this one file when a designed logo arrives.
 */
export function LogoMark({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="halo-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="halo-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <ellipse cx="34" cy="8" rx="13" ry="3.6" fill="none" stroke="url(#halo-gold)" strokeWidth="3" />
      <path
        d="M17 43h31a10 10 0 0 0 1.5-19.9A14 14 0 0 0 22.6 19 11 11 0 0 0 17 43z"
        fill="url(#halo-cloud)"
        stroke="#0369a1"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={`font-[Georgia,'Times_New_Roman',serif] text-2xl font-semibold tracking-tight ${light ? "text-white" : "text-sky-950"}`}
        >
          halo
        </span>
        <span className={`text-[10px] font-medium uppercase tracking-[0.25em] ${light ? "text-sky-200" : "text-sky-700"}`}>
          cooking book
        </span>
      </span>
    </span>
  );
}
