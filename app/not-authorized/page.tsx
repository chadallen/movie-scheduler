import Link from 'next/link';
import { AutoSignOut } from './AutoSignOut';

// Public route — renders even after sign-out completes.
// The AutoSignOut component clears the Clerk session on mount.
export default function NotAuthorizedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <AutoSignOut />
      <div className="w-full max-w-sm border-2 border-wire-border bg-wire-white p-8 rounded-sm">
        <h1 className="text-3xl font-bold mb-4 text-wire-text">Not on the List</h1>
        <p className="text-wire-text-muted mb-6">
          Your phone number isn&apos;t on the guest list for movie night. If you
          think this is a mistake, ask the host to add you.
        </p>
        <div className="border-2 border-wire-border bg-wire-surface p-4 rounded-sm text-center">
          <Link
            href="/"
            className="text-wire-text underline hover:no-underline"
          >
            Back to Movie Night
          </Link>
        </div>
      </div>
    </main>
  );
}
