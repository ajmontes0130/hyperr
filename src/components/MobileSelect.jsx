import React, { useState } from "react";
import { Drawer } from "vaul";
import { Check, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * MobileSelect — native bottom-sheet drawer on mobile, regular shadcn Select on desktop.
 * Props mirror shadcn Select: value, onValueChange, placeholder, options [{value, label}], className, triggerClassName
 */
export default function MobileSelect({ value, onValueChange, placeholder = "Select…", options = [], triggerClassName = "", children }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || value || "";

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder}>{selectedLabel || undefined}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring select-none ${triggerClassName}`}
        >
          <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl"
          style={{ background: "hsl(var(--card))", borderTop: "1px solid hsl(var(--border))", maxHeight: "80vh" }}
        >
          <div className="mx-auto mt-3 mb-2 h-1.5 w-10 rounded-full bg-muted-foreground/30 flex-shrink-0" />
          {placeholder && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 pb-2 flex-shrink-0">{placeholder}</p>
          )}
          <div className="overflow-y-auto pb-safe" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onValueChange(o.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-left transition-colors select-none active:bg-muted/60"
                  style={{ color: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}
                >
                  <span>{o.label}</span>
                  {selected && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}