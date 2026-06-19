"use client";

import { cn } from "@/lib/utils/cn";

const ICON_PATHS: Record<string, string> = {
  briefcase:
    "M4 7h16v10H4V7zm4-3h8v3H8V4zm-1 6h1v2H7v-2zm9 0h1v2h-1v-2z",
  dumbbell:
    "M3 10h2v4H3v-4zm16 0h2v4h-2v-4zm-14 1h1v2H5v-2zm12 0h1v2h-1v-2zm-10 0h8v2H7v-2z",
  cpu: "M4 4h16v16H4V4zm3 3h10v10H7V7zm2 2h6v6H9V9zm7-5v2h-2V4h2zm-4 0v2h-2V4h2zm4 16v-2h-2v2h2zm-4 0v-2h-2v2h2zM4 9H2V7h2v2zm0 4H2v-2h2v2zm16-4h2V7h-2v2zm0 4h2v-2h-2v2z",
  search:
    "M10 4a6 6 0 1 0 3.7 10.7l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  code: "M8 5l-5 7 5 7h2l-5-7 5-7H8zm8 0l5 7-5 7h-2l5-7-5-7h2z",
  heart:
    "M12 21l-1.5-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.2L12 21z",
  book: "M4 4h7v16H4V4zm9 0h7v16h-7V4zm2 2v12h3V6h-3zm-8 0v12h3V6H7z",
  home: "M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z",
  dollar:
    "M12 2v2c-3.3.5-5 2.3-5 4.5S9 12 12 12.8V18c-1.5-.3-2.5-1-3-2l-2 1c.8 1.8 2.7 3 5 3.2V22h2v-2c3.3-.5 5-2.3 5-4.5S17 12 14 11.2V6c1.5.3 2.5 1 3 2l2-1c-.8-1.8-2.7-3-5-3.2V2h-2zm0 6V6c1.5.3 2.3 1 2.6 2H12zm2 6v2c-1.5-.3-2.3-1-2.6-2H14z",
  star: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z",
  leaf: "M17 8C8 10 5.9 16.2 3.8 19.1l1.4 1.1c1.5-2 3.3-4.6 5.8-6.2v5h2v-5.5c2.1-.5 4-1.6 5.5-3.4 1-1.2 1.5-2.5 1.5-3.1V5l-3 3z",
};

interface WorldIconProps {
  icon: string;
  color?: string;
  size?: number;
  className?: string;
}

export function WorldIcon({ icon, color = "#3B82F6", size = 20, className }: WorldIconProps) {
  const path = ICON_PATHS[icon] ?? ICON_PATHS.star;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path d={path} fill={color} fillRule="evenodd" />
    </svg>
  );
}

export const AVAILABLE_ICONS = Object.keys(ICON_PATHS);
