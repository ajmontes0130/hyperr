export default function BrandedLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3.5 bg-background">
      <svg
        viewBox="0 0 100 100"
        className="w-9 h-9 text-primary animate-pulse"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 8px rgba(29,78,216,.35))" }}
      >
        <path d="M24 34H58" />
        <path d="M50 24L71 34L50 44" />
        <path d="M76 66H42" />
        <path d="M50 56L29 66L50 76" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-primary font-display">
        hyperr
      </span>
    </div>
  );
}