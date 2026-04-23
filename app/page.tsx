export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border-2 border-wire-border bg-wire-white p-8 rounded-sm">
        <h1 className="text-3xl font-bold mb-2 text-wire-text">Movie Night</h1>
        <p className="text-wire-text-muted mb-6">
          Suggest a movie for the queue.
        </p>
        <div className="border-2 border-wire-border bg-wire-surface p-4 rounded-sm text-center text-wire-text-muted">
          [ Coming soon ]
        </div>
      </div>
    </main>
  );
}
