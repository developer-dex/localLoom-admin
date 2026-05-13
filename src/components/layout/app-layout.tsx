/**
 * `App_Layout`: the persistent admin shell rendered inside the guarded
 * route group (design.md §9, Requirements 6.1, 6.4, 6.6).
 *
 * Structure:
 *
 *   ┌───────────────────────────────────────────────────────────┐
 *   │  AppTopbar (menu btn [mobile] + app name + toggle + user)│
 *   ├────────────┬──────────────────────────────────────────────┤
 *   │ AppSidebar │                                              │
 *   │  (md:+    )│                 <Outlet />                   │
 *   │            │                                              │
 *   └────────────┴──────────────────────────────────────────────┘
 *                   + <Toaster /> mounted once at the root
 *
 * Responsive behaviour (Req 6.4):
 *   - On `md:` and up the sidebar is a persistent `<aside>` with
 *     `bg-card border-r border-border`. The `Sheet` is still mounted
 *     but stays closed because its controlled `open` state is never
 *     flipped on wide viewports.
 *   - Below the `md:` breakpoint the aside is hidden via the `hidden`
 *     utility, and the mobile `Sheet` (side="left") becomes the only
 *     way to reach the sidebar. The topbar hamburger sets
 *     `sidebarOpen = true`; `AppSidebar` receives an `onNavigate`
 *     callback that flips it back to `false` so tapping a link closes
 *     the drawer automatically.
 *
 * Toaster (Req 6.6): mounted exactly once here so every feature that
 * emits a toast via `useToast` renders into a single viewport. It is
 * placed as a sibling of the layout tree (inside a fragment) so its
 * portal is unaffected by the flex container's layout.
 *
 * This module default-exports the component because the router uses
 * `React.lazy(() => import("@/components/layout/app-layout"))` and
 * `React.lazy` requires a default export.
 */

import * as React from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <>
      <div className="flex min-h-dvh w-full bg-background text-foreground">
        <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card">
          <AppSidebar />
        </aside>

        {/*
         * Below the md: breakpoint the persistent aside above is hidden
         * and this `Sheet` takes over. Mounting it unconditionally is
         * cheap (Radix renders nothing when `open` is false) and keeps
         * the component tree stable when the viewport crosses the
         * breakpoint.
         */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0 md:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Primary navigation for the admin panel.
              </SheetDescription>
            </SheetHeader>
            <AppSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col">
          <AppTopbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto bg-background p-6 text-foreground">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
