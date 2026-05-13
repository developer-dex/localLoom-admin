/**
 * Placeholder `UsersPage` for the reserved users module (Requirement
 * 10.1). The router only mounts this page when `features.users === true`
 * (Requirement 10.3), so reaching it in-app requires the flag to be
 * flipped on.
 *
 * Renders a shadcn `Card` announcing the module as coming soon. The full
 * implementation (list, filters, actions) is activated once the backend
 * `/api/admin/users` endpoints ship (Requirement 10.4).
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="p-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User management is not yet available. This module activates
            automatically once the backend users endpoints ship.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
