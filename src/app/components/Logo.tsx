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
      className={className}
      style={{ width: size, height: "auto", display: "block" }}
      {...props}
    />
  );
}
