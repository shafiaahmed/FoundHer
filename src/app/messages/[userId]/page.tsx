import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getProfileByIdIncludingReal } from "@/lib/supabase/directory";
import { canMessage, getThreadMessages } from "@/lib/supabase/messaging";
import { MessageThread } from "./MessageThread";

export default async function MessageThreadPage({ params }: PageProps<"/messages/[userId]">) {
  const { userId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=/messages/${userId}`);
  }

  if (userId === user.id || !(await canMessage(userId))) {
    notFound();
  }

  const profile = await getProfileByIdIncludingReal(userId);
  if (!profile) {
    notFound();
  }

  const messages = await getThreadMessages(userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/messages" className="text-sm font-medium text-violet-700 hover:text-violet-900">
        &larr; Back to messages
      </Link>
      <MessageThread
        otherUserId={userId}
        otherProfile={profile}
        initialMessages={messages}
        currentUserId={user.id}
      />
    </div>
  );
}
