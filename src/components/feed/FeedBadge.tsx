export default function FeedBadge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "accent";
}) {
  const color =
    tone === "primary"
      ? "var(--primary-color)"
      : tone === "accent"
        ? "var(--accent-color)"
        : "var(--muted-color)";

  return (
    <span
      className="font-mono-label inline-flex items-center gap-1 px-2 py-0.5 text-[0.6rem] rounded-full border"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}
