import * as React from "react";
import Link from "next/link";

type Variant = "primary" | "accent" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  accent: "btn-accent",
  ghost: "btn-ghost",
  quiet: "btn-quiet",
  danger: "btn-danger",
};
const sizeClass: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

function classes(variant: Variant, size: Size, className?: string) {
  return ["btn", variantClass[variant], sizeClass[size], className].filter(Boolean).join(" ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  return <button className={classes(variant, size, className)} {...rest} />;
}

export interface LinkButtonProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function LinkButton({ variant = "primary", size = "md", className, ...rest }: LinkButtonProps) {
  return <Link className={classes(variant, size, className)} {...rest} />;
}
