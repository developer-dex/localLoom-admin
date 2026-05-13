/**
 * Placeholder `NotFoundPage` (Requirement 11.6).
 *
 * The router mounts this inside the guarded route group so unknown paths
 * for an authenticated admin still render inside `App_Layout`, while an
 * unauthenticated visitor is redirected by `Protected_Route` to `/login`
 * first. A richer illustration + "back to dashboard" action can be
 * substituted later without any router changes.
 */

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh grid place-items-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}
