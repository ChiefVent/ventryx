import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,border-color,opacity] duration-150 ease-[var(--ease-out-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg hover:bg-fg/90 active:scale-[0.98]",
        accent:
          "bg-accent text-accent-fg hover:bg-accent/90 active:scale-[0.98]",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-fg/5 active:scale-[0.98]",
        ghost: "text-fg hover:bg-fg/6",
        link: "text-fg underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-11 rounded-full px-4 text-sm",
        md: "h-12 rounded-full px-5 text-sm",
        lg: "h-14 rounded-full px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
