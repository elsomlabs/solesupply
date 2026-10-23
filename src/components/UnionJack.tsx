"use client";

import { useId } from "react";

export function UnionJack({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "");

  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
      <defs>
        <clipPath id={raw}>
          <rect width="60" height="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${raw})`}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
