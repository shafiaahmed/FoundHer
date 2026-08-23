import { redirect } from "next/navigation";
import { PostsContent } from "./PostsContent";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { CommunityPost, PostCategory } from "@/lib/types";

interface PostRow {
  id: string;
  author_id: string;
  author_name: string;
  category: PostCategory;
  content: string;
  created_at: string;
  updated_at: string;
}

export default async function PostsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/posts");

  const profile = await getMyProfile();
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,author_id,author_name,category,content,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<PostRow[]>();

  const posts: CommunityPost[] = (data ?? []).map((post) => ({
    id: post.id,
    authorId: post.author_id,
    authorName: post.author_name,
    category: post.category,
    content: post.content,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  }));

  return (
    <PostsContent
      initialPosts={posts}
      currentUserId={user.id}
      currentUserName={profile.name}
      setupRequired={Boolean(error)}
    />
  );
}
