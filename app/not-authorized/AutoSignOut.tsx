'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

/**
 * Automatically signs the user out of Clerk when mounted.
 * Used on the /not-authorized page to clear the session for
 * a user who authenticated but is not on the allowlist.
 */
export function AutoSignOut() {
  const { signOut } = useClerk();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return null;
}
