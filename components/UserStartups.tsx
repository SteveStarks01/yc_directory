import React from "react";
import { client } from "@/sanity/lib/client";
import { STARTUPS_BY_AUTHOR_QUERY } from "@/sanity/lib/queries";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import StartupCardWithCommunity from "@/components/StartupCardWithCommunity";
import { auth } from "@clerk/nextjs/server";

const UserStartups = async ({ id }: { id: string }) => {
  const { userId } = await auth();
  const startups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id });

  // Check if this is the user's own profile
  const isOwnProfile = userId === id;

  return (
    <>
      {startups.length > 0 ? (
        startups.map((startup: StartupTypeCard) => (
          isOwnProfile ? (
            <StartupCardWithCommunity key={startup._id} post={startup} />
          ) : (
            <StartupCard key={startup._id} post={startup} />
          )
        ))
      ) : (
        <p className="no-result">No posts yet</p>
      )}
    </>
  );
};
export default UserStartups;
