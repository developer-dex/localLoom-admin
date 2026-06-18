/**
 * `App_Sidebar`: the primary navigation surface for the admin panel.
 *
 * Design notes (design.md §9, Requirements 6.2, 6.5, 10.3):
 *   - A single `navItems` registry combines the three fixed entries
 *     (Dashboard, Categories, Regions) with the four reserved entries
 *     (Users, Tradies, Reviews, Reports) that are gated by the compile-
 *     time `features.*` flags from `@/config/features`. Filtering by
 *     `enabled` keeps the sidebar in lockstep with `App_Router`, which
 *     reads the same flags — adding a new module is one entry + one
 *     route, nothing else in the shell needs to change (Req 10.4).
 *   - Each entry renders as a react-router-dom `NavLink`. The
 *     `className` callback form from react-router-dom is used so the
 *     currently matched route picks up `bg-accent text-accent-
 *     foreground` (Req 6.5) — both classes are theme tokens (Req 3.7),
 *     there is no hex or named color literal anywhere in this file.
 *   - An optional `onNavigate` callback is invoked on every link click
 *     so the mobile `Sheet` host (see `AppLayout`) can close itself
 *     after a navigation tap. On `md:` and up the persistent aside
 *     simply does not pass the prop, and the callback no-ops.
 */

import {
  Flag,
  Hammer,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Star,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { features } from "@/config/features";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { to: "/categories", label: "Categories", icon: Tags, enabled: true },
  { to: "/regions", label: "Regions", icon: MapPin, enabled: true },
  { to: "/users", label: "Users", icon: Users, enabled: features.users },
  { to: "/tradies", label: "Tradies", icon: Hammer, enabled: features.tradies },
  { to: "/reviews", label: "Reviews", icon: Star, enabled: features.reviews },
  { to: "/reports", label: "Reports", icon: Flag, enabled: features.reports },
  { to: "/help-desk", label: "Help Desk", icon: HelpCircle, enabled: features.helpDesk },
];

export interface AppSidebarProps {
  /**
   * Fired after a `NavLink` is clicked. The mobile `Sheet` host uses
   * this to close itself so the user is not left with the drawer open
   * on top of the freshly-navigated page. The persistent aside on
   * `md:` and up omits the prop and the handler no-ops.
   */
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const visibleItems = navItems.filter((item) => item.enabled);

  return (
    <nav
      aria-label="Primary"
      className="flex h-full flex-col gap-1 p-4 text-sm"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
