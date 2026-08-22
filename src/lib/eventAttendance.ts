import { Event } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type AttendanceRow = {
  event_key: string;
  user_id: string;
  display_name: string;
  status: string;
  visibility: string;
};

type JoinRequestRow = {
  id: string;
  event_id: string;
  requester_id: string;
  requester_name: string;
  organizer_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
};

export async function attachFoundHerAttendance(events: Event[]): Promise<Event[]> {
  if (events.length === 0) return events;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return events;

  const [{ data }, { data: requestData }] = await Promise.all([
    supabase
    .from("event_attendance")
    .select("event_key,user_id,display_name,status,visibility")
    .in("event_key", events.map((event) => event.id))
    .in("status", ["going", "attended"]),
    supabase
      .from("event_join_requests")
      .select("id,event_id,requester_id,requester_name,organizer_id,status,created_at")
      .in("event_id", events.map((event) => event.id)),
  ]);

  const rows = (data ?? []) as AttendanceRow[];
  const requests = (requestData ?? []) as JoinRequestRow[];

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
      currentUserIsOrganizer: !event.isExternal && event.creatorId === user.id,
      currentUserJoinRequest: requests
        .filter((request) => request.event_id === event.id && request.requester_id === user.id)
        .map((request) => ({ id: request.id, status: request.status }))[0],
      pendingJoinRequests: requests
        .filter(
          (request) =>
            request.event_id === event.id &&
            request.organizer_id === user.id &&
            request.status === "pending"
        )
        .map((request) => ({
          id: request.id,
          requesterId: request.requester_id,
          requesterName: request.requester_name,
          createdAt: request.created_at,
        })),
    };
  });
}
