export default function SettingsPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="mt-8 space-y-8">
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update your profile information including username and avatar.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Account Security</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your password and account security settings.
            </p>
          </div>

          <div className="rounded-lg border p-4 border-destructive/50">
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Delete your account and all associated data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 