import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function toIcsDate(isoString: string): string {
  return new Date(isoString)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("scheduled_movies")
    .select("id, title, runtime_minutes, ics_uid, available_slots!inner(starts_at)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = data as unknown as {
    id: string;
    title: string;
    runtime_minutes: number | null;
    ics_uid: string | null;
    available_slots: { starts_at: string } | { starts_at: string }[] | null;
  };

  const slot = Array.isArray(row.available_slots)
    ? row.available_slots[0]
    : row.available_slots;
  const startsAt = slot?.starts_at;
  if (!startsAt) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  const runtimeMs = (row.runtime_minutes ?? 120) * 60 * 1000;
  const endsAt = new Date(new Date(startsAt).getTime() + runtimeMs).toISOString();
  const uid = row.ics_uid ?? crypto.randomUUID();
  const dtstamp = toIcsDate(new Date().toISOString());
  const dtstart = toIcsDate(startsAt);
  const dtend = toIcsDate(endsAt);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Movie Scheduler//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${row.title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="movie-night.ics"',
    },
  });
}
