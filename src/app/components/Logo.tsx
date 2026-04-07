import type { ComponentPropsWithoutRef } from "react";

interface LogoProps extends ComponentPropsWithoutRef<"svg"> {
  size?: number;
}

export function Logo({ size = 32, className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 30h56v18l-8 10H16l-8-10V30Z" fill="#FDB515" />
      <path d="M8 30h56v-18a4 4 0 0 0-4-4H14a4 4 0 0 0-4 4v18Z" fill="#003262" />
      <rect x="10" y="6" width="12" height="12" rx="5" fill="#003262" />
      <rect x="30" y="6" width="12" height="12" rx="5" fill="#003262" />
      <rect x="50" y="6" width="12" height="12" rx="5" fill="#003262" />
      <path d="M36 36c-4.4 0-8 3.6-8 8v6h16v-6c0-4.4-3.6-8-8-8Z" fill="#003262" />
      <path d="M36 40a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-1 6v4h2v-4h-2Z" fill="#FDB515" />
    </svg>
  );
}
