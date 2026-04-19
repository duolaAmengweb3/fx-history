import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-muted)] text-[var(--color-foreground)]",
        success: "border-transparent bg-green-100 text-green-800",
        danger: "border-transparent bg-red-100 text-red-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        info: "border-transparent bg-blue-100 text-blue-800",
        outline: "text-[var(--color-foreground)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
