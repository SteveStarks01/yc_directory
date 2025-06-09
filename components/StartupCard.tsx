"use client";

import { cn, formatDate } from "@/lib/utils";
import { EyeIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Author, Startup } from "@/sanity/types";
import OptimizedImage from "./ui/OptimizedImage";
import { memo, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CommunityFollowers from "./CommunityFollowers";

export type StartupTypeCard = Omit<Startup, "author"> & { author?: Author };

const StartupCard = memo(({ post }: { post: StartupTypeCard }) => {
  const {
    _createdAt,
    createdAt,
    views,
    author,
    title,
    category,
    _id,
    image,
    description,
  } = post;

  // For now, we'll show "Create Community" by default
  // TODO: Implement community checking once API route is working
  const [hasCommunity] = useState(false);
  const [communitySlug] = useState<string>('');
  const [isCheckingCommunity] = useState(false);

  return (
    <li className="startup-card group">
      <Card className="grid grid-rows-[auto_auto_1fr_auto] h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
        {/* Image Section */}
        <div className="aspect-[16/9] w-full overflow-hidden rounded-t-lg">
          <Link
            href={`/startup/${_id}`}
            className="block transition-opacity duration-200 hover:opacity-80"
          >
            <OptimizedImage
              src={image || "/images/block/placeholder-dark-1.svg"}
              alt={title}
              width={400}
              height={225}
              className="h-full w-full object-cover object-center"
              priority={false}
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        </div>

        {/* Header Section */}
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-3">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <div className="flex gap-1.5 items-center text-muted-foreground">
              <EyeIcon className="size-3" />
              <span className="text-xs">{views}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold hover:underline md:text-xl line-clamp-2">
            <Link href={`/startup/${_id}`} className="text-foreground">
              {title}
            </Link>
          </h3>

          {/* Author info */}
          <div className="flex items-center gap-2 mt-2">
            <Link href={`/user/${author?._id}`}>
              <OptimizedImage
                src={author?.image}
                alt={author?.name || 'User avatar'}
                width={24}
                height={24}
                className="rounded-full hover:scale-105 transition-transform duration-200"
                priority={false}
                quality={75}
                sizes="24px"
                fallbackSrc="/images/block/placeholder-dark-1.svg"
              />
            </Link>
            <div className="flex flex-col">
              <Link href={`/user/${author?._id}`}>
                <p className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {author?.name}
                </p>
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDate(createdAt || _createdAt)}
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="pt-0 pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {description}
          </p>

          {/* Community Followers Section - Inside Card */}
          <CommunityFollowers
            startupId={_id}
            className="mt-3"
          />
        </CardContent>

        {/* Footer Section */}
        <CardFooter className="pt-4 flex gap-2">
          <Button asChild className="flex-1 bg-black text-white hover:bg-gray-800">
            <Link href={`/startup/${_id}`}>
              Details
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>

          {isCheckingCommunity ? (
            <Button variant="outline" className="flex-1" disabled>
              <Skeleton className="h-4 w-20" />
            </Button>
          ) : hasCommunity ? (
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/community/${communitySlug}`}>
                Manage Community
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/startup/${_id}/community`}>
                Create Community
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </li>
  );
});

StartupCard.displayName = 'StartupCard';

export const StartupCardSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4].map((index: number) => (
      <li key={cn("skeleton", index)} className="startup-card group">
        <Card className="grid grid-rows-[auto_auto_1fr_auto] h-full animate-pulse">
          <div className="aspect-[16/9] w-full">
            <Skeleton className="h-full w-full rounded-t-lg" />
          </div>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </CardFooter>
        </Card>
      </li>
    ))}
  </>
);

export default StartupCard;
