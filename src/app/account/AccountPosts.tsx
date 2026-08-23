"use client";

import Link from "next/link";
import { useState } from "react";
import { CommunityPost, PostCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<PostCategory, string> = {
  question: "Question",
  collaboration: "Looking for collaborators",
  offering_help: "Offering help",
  general: "General",
};

export function AccountPosts({ initialPosts }: { initialPosts: CommunityPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function deletePost(postId: string) {
    setError("");
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to delete this post");
        return;
      }
      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setConfirmingDelete(null);
    }
  }

  return (
    <div className="mt-8 border-t border-stone-100 pt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-stone-900">My posts</h2>
        <Link
          href="/posts"
          className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
        >
          Create post
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-violet-100 px-2 py-1 font-semibold text-violet-800">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                    <span className="text-stone-400">{formatPostDate(post.createdAt)}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                    {post.content}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-stone-200 pt-3">
                <Link
                  href={`/posts#post-${post.id}`}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-violet-300 hover:text-violet-800"
                >
                  View in feed
                </Link>
                {confirmingDelete === post.id ? (
                  <>
                    <span className="text-xs text-stone-500">Delete this post?</span>
                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(null)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(post.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-stone-600">
          You haven&apos;t created any posts yet.
        </div>
      )}
    </div>
  );
}

function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Toronto",
  }).format(new Date(date));
}
