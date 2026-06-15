export default function Flags({ flags }: { flags: string[] }) {
  if (!flags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((f) => {
        const warn = f.startsWith("⚠");
        return (
          <span
            key={f}
            className={`chip ${
              warn
                ? "border-bad/30 bg-bad/10 text-bad"
                : "border-edge bg-panel2 text-slate-300"
            }`}
          >
            {f}
          </span>
        );
      })}
    </div>
  );
}
