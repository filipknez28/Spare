import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/35 transition-opacity duration-150" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-screen w-full max-w-lg flex-col",
            "rounded-t-2xl bg-card text-card-foreground shadow-lift outline-none",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const SheetTitle = Drawer.Title;
export const SheetDescription = Drawer.Description;
