import type { ComponentPropsWithoutRef } from "react";
import logoImg from "../assets/logo.png";

interface LogoProps extends ComponentPropsWithoutRef<"img"> {
  size?: number;
}

export function Logo({ size = 32, className, ...props }: LogoProps) {
  return (
    <img
      src={logoImg}
      alt="CalDaily logo"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}
