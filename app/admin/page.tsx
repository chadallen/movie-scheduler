import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { listUsers } from "@/lib/actions/adminUsers";
import UserManagement from "./UserManagement";

export const metadata: Metadata = {
  title: "Admin — User Management",
};

export default async function AdminPage() {
  // Auth guard: check phone vs ADMIN_PHONE directly (do NOT call isAdmin() from adminUsers.ts)
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const adminPhone = process.env.ADMIN_PHONE;
  const userPhone = user.phoneNumbers?.[0]?.phoneNumber;

  if (!adminPhone || !userPhone || userPhone !== adminPhone) {
    redirect("/not-authorized");
  }

  // Fetch users server-side and pass to client component
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  try {
    users = await listUsers();
  } catch (err) {
    console.error("[AdminPage] listUsers error:", err);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-wire-text">User Management</h1>
        <p className="text-wire-text-muted text-sm mb-8">
          Manage who can access Theater With a View.
        </p>
        <UserManagement initialUsers={users} />
      </div>
    </main>
  );
}
