import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CommunityPost, PostCategory } from "@/lib/types";

const POST_CATEGORIES: PostCategory[] = [
  "question",
  "collaboration",
  "offering_help",
  "general",
];

interface PostRow {
  id: string;
  author_id: string;
  author_name: string;
  category: PostCategory;
  content: string;
  created_at: string;
  updated_at: string;
}

function toPost(row: PostRow): CommunityPost {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    category: row.category,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id,author_id,author_name,category,content,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<PostRow[]>();

  if (error) {
    return NextResponse.json({ error: "Unable to load posts" }, { status: 500 });
  }

  return NextResponse.json({ posts: (data ?? []).map(toPost) });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { content?: unknown; category?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const category = body.category;

  if (!content) {
    return NextResponse.json({ error: "Write something before posting" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Posts must be 2,000 characters or fewer" }, { status: 400 });
  }
  if (typeof category !== "string" || !POST_CATEGORIES.includes(category as PostCategory)) {
    return NextResponse.json({ error: "Choose a valid post category" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single<{ name: string }>();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Complete your profile before posting" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      author_name: profile.name,
      category,
      content,
    })
    .select("id,author_id,author_name,category,content,created_at,updated_at")
    .single<PostRow>();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to publish your post" }, { status: 500 });
  }

  return NextResponse.json({ post: toPost(data) }, { status: 201 });
}
