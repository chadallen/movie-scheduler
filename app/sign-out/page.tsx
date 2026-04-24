"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut().then(() => router.push("/sign-in"));
  }, [signOut, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <p className="text-wire-text-muted text-base">Signing out…</p>
    </main>
  );
}
