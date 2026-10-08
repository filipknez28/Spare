import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-card text-foreground shadow-border hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        outline: "bg-transparent text-foreground shadow-border hover:bg-accent",
        sage: "bg-sage text-primary-foreground hover:opacity-90",
        destructive: "bg-rust-soft text-rust hover:bg-rust-soft/80",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-xl px-5",
        icon: "size-11",
        "icon-sm": "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    staticPress?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  staticPress = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        !staticPress && "active:not-disabled:scale-[0.96]",
        className,
      )}
      {...props}
    />
  );
}
