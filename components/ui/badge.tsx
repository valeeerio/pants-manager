import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-[3px] text-[11px] font-medium leading-none tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline:
          "border-slate-200/80 text-foreground",
        success:
          "border-emerald-200/70 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200/70 bg-amber-50 text-amber-700",
        info:
          "border-sky-200/70 bg-sky-50 text-sky-700",
        muted:
          "border-slate-200/70 bg-slate-100 text-slate-500",
        destructive:
          "border-red-200/70 bg-red-50 text-red-600",
        teal:
          "border-teal-200/70 bg-teal-50 text-teal-700"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
