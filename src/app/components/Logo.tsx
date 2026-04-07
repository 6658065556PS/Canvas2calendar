import type { ComponentPropsWithoutRef } from "react";
import logoImg from "../../assets/logo.png";

interface LogoProps extends ComponentPropsWithoutRef<"img"> {
  size?: number;
}

const LOGO_ASPECT_RATIO = 274 / 306;

export function Logo({ size = 32, className, ...props }: LogoProps) {
  return (
    <img
      src={logoImg}
      alt="CalDaily logo"
      className={className}
      style={{
        width: Math.round(size * LOGO_ASPECT_RATIO),
        height: size,
        maxWidth: "100%",
        maxHeight: "100%",
        display: "block",
      }}
      {...props}
    />
  );
}
