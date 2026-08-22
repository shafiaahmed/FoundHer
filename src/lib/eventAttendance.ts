import { Event } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type AttendanceRow = {
  event_key: string;
  user_id: string;
  display_name: string;
  status: string;
  visibility: string;
};

export async function attachFoundHerAttendance(events: Event[]): Promise<Event[]> {
  if (events.length === 0) return events;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return events;

  const { data, error } = await supabase
    .from("event_attendance")
    .select("event_key,user_id,display_name,status,visibility")
    .in("event_key", events.map((event) => event.id))
    .in("status", ["going", "attended"]);

  if (error || !data) return events;
  const rows = data as AttendanceRow[];

  return events.map((event) => {
    const attendance = rows.filter((row) => row.event_key === event.id);
    const visible = attendance.filter(
      (row) => row.visibility === "members" || row.user_id === user.id
    );

    return {
      ...event,
      foundHerAttendeeCount: attendance.length,
      foundHerAttendees: visible.map((row) => ({
        userId: row.user_id,
        userName: row.display_name,
      })),
      currentUserGoing: attendance.some((row) => row.user_id === user.id),
    };
  });
}
