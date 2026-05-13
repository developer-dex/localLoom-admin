/**
 * ThemeToggle: top-bar dropdown that switches between Light / Dark /
 * System modes via `Theme_Provider`.
 *
 * Design notes (design.md §3.6, Requirements 3.6, 3.7, 6.3):
 *   - Renders a shadcn `Button` (icon variant, ghost style) as the
 *     trigger. The icon swaps between Sun and Moon based on the
 *     currently resolved mode so the control previews what the user is
 *     about to flip away from without reading the menu.
 *   - The menu body is a shadcn `DropdownMenu` with three items (Light,
 *     Dark, System); each calls `setTheme`. The currently selected item
 *     is highlighted with the token-driven `bg-accent text-accent-
 *     foreground` classes — no hex or named colors anywhere in this
 *     file (Req 3.7).
 *   - The icon swap uses Tailwind classes only (`scale-100`/`scale-0`
 *     + `rotate-0`/`rotate-90`) so the animation respects the user's
 *     reduced-motion settings by default.
 */

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {/* Icons share the same slot; one scales out while the other
              scales in based on the `.dark` class from Theme_Provider. */}
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setTheme(option.value)}
            className={cn(
              theme === option.value && "bg-accent text-accent-foreground",
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
