import { scoreBg } from "@/lib/format";

export default function ScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-14 w-14 text-2xl"
      : size === "sm"
        ? "h-8 w-8 text-sm"
        : "h-10 w-10 text-base";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border font-bold tabular-nums ${dims} ${scoreBg(
        score,
      )}`}
      title={`Composite score: ${score}/100`}
    >
      {score}
    </span>
  );
}
