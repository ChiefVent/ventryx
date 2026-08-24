import { cn } from "@/lib/utils";

export function VentryxMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-fg" />
      <path
        d="M8.2 9.2h4.1L16 21.4 19.7 9.2h4.1L17.2 23.2h-2.4L8.2 9.2Z"
        className="fill-bg"
      />
    </svg>
  );
}
