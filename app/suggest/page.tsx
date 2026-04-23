// Protected route — requires authentication (enforced by middleware.ts).
// This placeholder will be replaced in a later epic with the movie search feature.
export default function SuggestPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border-2 border-wire-border bg-wire-white p-8 rounded-sm">
        <h1 className="text-3xl font-bold mb-2 text-wire-text">Suggest a Movie</h1>
        <div className="border-2 border-wire-border bg-wire-surface p-4 rounded-sm text-center text-wire-text-muted">
          [ Movie search — coming soon ]
        </div>
      </div>
    </main>
  );
}
