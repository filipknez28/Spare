import { durationParts } from "@/lib/time";
import { cn } from "@/lib/utils";

type DurationHeroProps = {
  minutes: number;
  className?: string;
  size?: "lg" | "md";
};

export function DurationHero({ minutes, className, size = "lg" }: DurationHeroProps) {
  const parts = durationParts(minutes);
  const num = size === "lg" ? "text-6xl sm:text-7xl" : "text-4xl";
  const unit = size === "lg" ? "text-2xl sm:text-3xl" : "text-lg";

  return (
    <p
      className={cn(
        "flex items-baseline font-display font-medium tracking-tight tabular-nums leading-none",
        className,
      )}
    >
      {parts.sign ? <span className={cn(num, "mr-0.5")}>{parts.sign}</span> : null}
      {parts.hasHours ? (
        <>
          <span className={num}>{parts.hours}</span>
          <span className={cn(unit, "ml-1 font-sans font-medium text-muted-foreground")}>
            h
          </span>
        </>
      ) : null}
      {parts.hasMinutes ? (
        <>
          <span className={cn(num, parts.hasHours && "ml-3")}>{parts.minutes}</span>
          <span className={cn(unit, "ml-1 font-sans font-medium text-muted-foreground")}>
            m
          </span>
        </>
      ) : null}
    </p>
  );
}

export function DurationInline({
  minutes,
  className,
}: {
  minutes: number;
  className?: string;
}) {
  const parts = durationParts(minutes);
  const label = [
    parts.sign,
    parts.hasHours ? `${parts.hours}h` : null,
    parts.hasMinutes ? `${parts.minutes}m` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cn("tabular-nums", className)}>
      {label.trim() || "0m"}
    </span>
  );
}
