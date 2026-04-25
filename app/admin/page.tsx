import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { listUsers } from "@/lib/actions/adminUsers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import UserManagement from "./UserManagement";
import ScheduledMovies, { type ScheduledMovie } from "./ScheduledMovies";

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

  // Fetch upcoming scheduled movies server-side
  let scheduledMovies: ScheduledMovie[] = [];
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("scheduled_movies")
      .select("id, title, suggested_by_phone, available_slots!inner(starts_at)")
      .gt("available_slots.starts_at", new Date().toISOString())
      .order("available_slots.starts_at", { ascending: true });

    if (error) {
      console.error("[AdminPage] scheduled_movies query error:", error.message);
    } else if (data) {
      scheduledMovies = data.map((row) => ({
        id: row.id as string,
        title: row.title as string,
        suggested_by_phone: row.suggested_by_phone as string,
        starts_at: (row.available_slots as unknown as { starts_at: string } | { starts_at: string }[]) instanceof Array
          ? (row.available_slots as unknown as { starts_at: string }[])[0]?.starts_at ?? ""
          : (row.available_slots as unknown as { starts_at: string }).starts_at,
      }));
    }
  } catch (err) {
    console.error("[AdminPage] scheduled_movies fetch error:", err);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl flex flex-col gap-12">
        {/* User Management */}
        <section>
          <h1 className="text-3xl font-bold mb-2 text-wire-text">User Management</h1>
          <p className="text-wire-text-muted text-sm mb-8">
            Manage who can access Theater With a View.
          </p>
          <UserManagement initialUsers={users} />
        </section>

        {/* Scheduled Movies */}
        <section>
          <h1 className="text-3xl font-bold mb-2 text-wire-text">Scheduled Movies</h1>
          <p className="text-wire-text-muted text-sm mb-8">
            Upcoming scheduled movies. Deleting a movie restores the slot for new suggestions.
          </p>
          <ScheduledMovies initialMovies={scheduledMovies} />
        </section>
      </div>
    </main>
  );
}
