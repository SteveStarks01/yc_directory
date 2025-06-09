import { Suspense } from "react";
import { client } from "@/sanity/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_ID_QUERY,
  EDITOR_PICKS_FALLBACK_QUERY,
} from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import markdownit from "markdown-it";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const md = markdownit();

// Removed experimental_ppr as it's only available in canary versions
// export const experimental_ppr = true;

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  const [post, playlistResult] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks-new",
    }),
  ]);

  // Safely extract editor posts with fallback to recent startups
  let editorPosts = playlistResult?.select || [];

  // If no playlist found, fetch recent startups as fallback
  if (!editorPosts || editorPosts.length === 0) {
    try {
      editorPosts = await client.fetch(EDITOR_PICKS_FALLBACK_QUERY);
    } catch (error) {
      console.warn('Failed to fetch editor picks fallback:', error);
      editorPosts = [];
    }
  }

  if (!post) return notFound();

  const parsedContent = md.render(post?.pitch || "");

  // Ensure we have safe fallbacks for all post properties
  const safePost = {
    ...post,
    author: post.author || { _id: '', name: 'Unknown', image: '', username: 'unknown' },
    title: post.title || 'Untitled Startup',
    description: post.description || 'No description available',
    category: post.category || 'Uncategorized',
    image: post.image || '/placeholder-image.jpg',
    _createdAt: post._createdAt || new Date().toISOString(),
  };

  return (
    <>
      <section className="hero_container !min-h-[230px]">
        <p className="tag">{formatDate(safePost._createdAt)}</p>

        <h1 className="heading">{safePost.title}</h1>
        <p className="sub-heading !max-w-5xl">{safePost.description}</p>
      </section>

      <section className="section_container">
        <img
          src={safePost.image}
          alt="thumbnail"
          className="w-full h-auto rounded-xl"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${safePost.author._id}`}
              className="flex gap-2 items-center mb-3"
            >
              <Image
                src={safePost.author.image || '/default-avatar.png'}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
              />

              <div>
                <p className="text-20-medium">{safePost.author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{safePost.author.username}
                </p>
              </div>
            </Link>

            <p className="category-tag">{safePost.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>
          {parsedContent ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {Array.isArray(editorPosts) && editorPosts.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>

            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((editorPost: StartupTypeCard, i: number) => (
                <StartupCard key={editorPost._id || i} post={editorPost} />
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  );
};

export default Page;
