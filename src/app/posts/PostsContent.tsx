"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { CommunityPost, PostCategory } from "@/lib/types";

const CATEGORY_DETAILS: Record<
  PostCategory,
  { label: string; shortLabel: string; description: string; classes: string }
> = {
  question: {
    label: "Ask a question",
    shortLabel: "Question",
    description: "Get advice or answers from the community.",
    classes: "border-violet-200 bg-violet-50 text-violet-800",
  },
  collaboration: {
    label: "Find my people",
    shortLabel: "Looking for collaborators",
    description: "Find a friend, study partner, teammate, or someone learning the same skill.",
    classes: "border-rose-200 bg-rose-50 text-rose-800",
  },
  offering_help: {
    label: "Offer help",
    shortLabel: "Offering help",
    description: "Share a skill, service, resource, or support you can provide.",
    classes: "border-amber-200 bg-amber-50 text-amber-800",
  },
  general: {
    label: "Share something",
    shortLabel: "General",
    description: "Post an update, thought, win, or anything else.",
    classes: "border-stone-200 bg-stone-100 text-stone-700",
  },
};

const CATEGORIES = Object.keys(CATEGORY_DETAILS) as PostCategory[];
type Filter = "all" | "mine" | PostCategory;

interface PostsContentProps {
  initialPosts: CommunityPost[];
  currentUserId: string;
  currentUserName: string;
  setupRequired: boolean;
}

export function PostsContent({
  initialPosts,
  currentUserId,
  currentUserName,
  setupRequired,
}: PostsContentProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [category, setCategory] = useState<PostCategory>("general");
  const [filter, setFilter] = useState<Filter>("all");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const visiblePosts = useMemo(() => {
    if (filter === "all") return posts;
    if (filter === "mine") return posts.filter((post) => post.authorId === currentUserId);
    return posts.filter((post) => post.category === filter);
  }, [currentUserId, filter, posts]);

  async function publishPost(event: FormEvent) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmedContent, category }),
      });
      const result = (await response.json()) as { post?: CommunityPost; error?: string };

      if (!response.ok || !result.post) {
        setError(result.error ?? "Unable to publish your post");
        return;
      }

      setPosts((current) => [result.post!, ...current]);
      setContent("");
      setFilter("all");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          Community
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">Posts</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Ask questions, find people to learn and build with, offer support, or simply share what is
          on your mind.
        </p>
      </header>

      {setupRequired ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">One database step is required</p>
          <p className="mt-1">
            Run <code className="rounded bg-white/70 px-1.5 py-0.5">20260822_community_posts.sql</code>{" "}
            in the Supabase SQL Editor, then refresh this page.
          </p>
        </div>
      ) : (
        <>
          <form
            onSubmit={publishPost}
            className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-800">
                {initials(currentUserName)}
              </div>
              <div>
                <p className="font-semibold text-stone-900">Create a post</p>
                <p className="text-sm text-stone-500">Posting as {currentUserName}</p>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="What would you like to share with the FoundHer community?"
              className="mt-5 w-full resize-none rounded-xl border border-stone-300 px-4 py-3 text-sm leading-6 text-stone-800 placeholder:text-stone-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-stone-800">What kind of post is this?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CATEGORIES.map((option) => {
                  const details = CATEGORY_DETAILS[option];
                  const selected = category === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategory(option)}
                      className={`rounded-xl border p-3 text-left transition ${
                        selected
                          ? `${details.classes} ring-2 ring-violet-200`
                          : "border-stone-200 bg-white text-stone-700 hover:border-violet-200 hover:bg-violet-50/40"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{details.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 opacity-75">{details.description}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-stone-100 pt-4">
              <span className="text-xs text-stone-400">{content.length}/2,000</span>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="mt-8" aria-labelledby="community-feed-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="community-feed-heading" className="text-xl font-semibold text-stone-900">
                Community feed
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <FilterButton selected={filter === "all"} onClick={() => setFilter("all")}>
                  All
                </FilterButton>
                <FilterButton selected={filter === "mine"} onClick={() => setFilter("mine")}>
                  My posts
                </FilterButton>
                {CATEGORIES.map((option) => (
                  <FilterButton
                    key={option}
                    selected={filter === option}
                    onClick={() => setFilter(option)}
                  >
                    {CATEGORY_DETAILS[option].shortLabel}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {visiblePosts.length > 0 ? (
                visiblePosts.map((post) => {
                  const details = CATEGORY_DETAILS[post.category];
                  return (
                    <article id={`post-${post.id}`} key={post.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-700">
                            {initials(post.authorName)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/profile/${post.authorId}`}
                              className="font-semibold text-stone-900 hover:text-violet-700 hover:underline"
                            >
                              {post.authorName}
                            </Link>
                            <p className="text-xs text-stone-400">{formatDate(post.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${details.classes}`}>
                          {details.shortLabel}
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-stone-700">
                        {post.content}
                      </p>

                      {post.authorId === currentUserId && (
                        <div className="mt-4 flex justify-end border-t border-stone-100 pt-3">
                          {confirmingDelete === post.id ? (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-stone-500">Delete this post?</span>
                              <button
                                type="button"
                                onClick={() => deletePost(post.id)}
                                className="rounded-full bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDelete(null)}
                                className="rounded-full px-3 py-1.5 font-semibold text-stone-600 hover:bg-stone-100"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingDelete(post.id)}
                              className="text-xs font-medium text-stone-400 transition hover:text-rose-600"
                            >
                              Delete post
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
                  <p className="font-semibold text-stone-700">
                    {filter === "mine" ? "You haven't posted yet" : "No posts here yet"}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {filter === "mine"
                      ? "Use the form above to share something with the community."
                      : "Be the first to start this conversation."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function FilterButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        selected
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-stone-200 bg-white text-stone-600 hover:border-violet-300 hover:text-violet-800"
      }`}
    >
      {children}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Toronto",
  }).format(new Date(date));
}
