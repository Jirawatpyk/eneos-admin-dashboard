/**
 * Settings Page
 * Story 1.5: Role-based Access Control
 *
 * AC#3: Admin can access settings
 * AC#6: Viewers are redirected away (handled by middleware)
 */

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <p className="text-muted-foreground">
        This page is only accessible to administrators.
      </p>
    </div>
  );
}
