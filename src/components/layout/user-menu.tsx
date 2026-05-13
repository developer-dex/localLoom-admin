/**
 * `User_Menu`: the admin identity + account-actions surface in the top
 * bar (design.md §9, Requirements 5.7, 5.11, 6.3).
 *
 * Composition:
 *   - A shadcn `DropdownMenu` whose trigger is a ghost `Button` wrapping
 *     an `Avatar` + the admin's name. The ghost variant gives us
 *     token-driven hover and focus states (`bg-accent`, `ring-ring`)
 *     without any hex or named color literals in this file (Req 3.7).
 *   - `AvatarImage` is fed `admin.avatar ?? ""`; when the remote image
 *     errors or is absent, the `AvatarFallback` renders the first
 *     letter of the admin's display name as a neutral placeholder.
 *   - Two items: "Change password" navigates to `/change-password`
 *     (Req 5.11) and "Logout" calls `useAuth().logout()` (best effort;
 *     tolerant of a failing backend call, see auth-provider.tsx) then
 *     navigates to `/login` with `replace: true` so the user cannot
 *     hit Back to return to a logged-out admin page (Req 5.7).
 *
 * When the provider has no admin (the only meaningful case is a render
 * before the auth layer has populated the context; Protected_Route
 * should prevent this in practice), the component renders `null` so
 * the top bar simply omits the user menu instead of flashing an empty
 * avatar.
 */

import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";

export function UserMenu() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  if (!admin) return null;

  const initial = (admin.name ?? "?").charAt(0).toUpperCase();

  const handleLogout = async () => {
    // `logout` is best-effort: it clears local storage and flips the
    // provider to `unauthenticated` regardless of the backend response
    // (see auth-provider.tsx), so we navigate in both the success and
    // failure branches without surfacing a toast here.
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 px-2 py-1"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={admin.avatar ?? ""} alt="" />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {admin.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onSelect={() => {
            navigate("/change-password");
          }}
        >
          Change password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void handleLogout();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
