export default function SettingsPage() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top,#132238_0%,#0b1220_42%,#020617_100%)] px-6 py-10 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-8 backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Workspace settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Profile preferences, workspace policies, and integrations will live here.
            This page is ready as the entry point for account settings.
          </p>
        </div>
      </div>
    </section>
  )
}
