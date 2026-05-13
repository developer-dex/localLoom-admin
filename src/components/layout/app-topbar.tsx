/**
 * `App_Topbar`: fixed top bar rendered by `App_Layout` (design.md §9,
 * Requirements 6.3, 6.4).
 *
 * Layout:
 *   - Left: a `Menu` icon button visible only below `md:` (the mobile
 *     breakpoint shadcn uses for its drawer patterns) plus the app
 *     name from `env.appName`. The menu button forwards its click to
 *     the parent `App_Layout` via the `onOpenSidebar` prop so the
 *     responsive `Sheet` can open (Req 6.4).
 *   - Right: the `ThemeToggle` (design.md §3, Req 6.3) followed by the
 *     `UserMenu` (Req 5.7, 5.11).
 *
 * Styling is token-driven: `bg-card` + `border-b border-border` so the
 * top bar separates visually from the content area via the theme
 * palette, with no hex or named color literals (Req 3.7).
 */

import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

export interface AppTopbarProps {
  /**
   * Fired when the mobile menu button is tapped. `App_Layout` uses this
   * to flip its `sidebarOpen` state, which in turn opens the shadcn
   * `Sheet` that hosts `<AppSidebar />` on narrow viewports.
   */
  onOpenSidebar: () => void;
}

export function AppTopbar({ onOpenSidebar }: AppTopbarProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenSidebar}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <span className="text-base font-semibold text-foreground">
        {env.appName}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
