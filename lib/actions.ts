"use server";

import { auth } from "@clerk/nextjs/server";
import { parseServerActionResponse } from "@/lib/utils";
import slugify from "slugify";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string,
) => {
  const { userId } = await auth();

  if (!userId)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { title, description, category, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "pitch"),
  );

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    // Get or create user profile
    let userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId }
    );

    if (!userProfile) {
      // Create user profile if it doesn't exist
      userProfile = await writeClient.create({
        _type: "userProfile",
        userId: userId,
        name: "User", // Default name, will be updated by user later
        username: `user_${userId.slice(-8)}`, // Generate username from user ID
        email: "", // Will be updated when user provides it
        bio: "",
        image: "", // Default avatar
        socialLinks: {},
        skills: [],
        interests: [],
        location: {},
        company: "",
        position: "",
        website: "",
        verified: false,
        role: "user",
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });
    }

    const startup = {
      // New field names (primary)
      name: title,
      description,
      industry: category,
      logo: link,
      slug: {
        _type: slug,
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: userProfile._id,
      },
      founders: [
        {
          _type: "reference",
          _ref: userProfile._id,
        },
      ],
      pitch,
      status: "active", // Set status to active so it appears in queries
      visibility: "public", // Set default visibility
      views: 0, // Initialize views counter
      stage: "idea", // Default stage for new startups
      createdAt: new Date().toISOString(), // Set creation timestamp
      updatedAt: new Date().toISOString(), // Set update timestamp

      // Legacy field names for backward compatibility
      title,
      category,
      image: link,
    };

    const result = await writeClient.create({ _type: "startup", ...startup });

    return parseServerActionResponse({
      ...result,
      authorId: userProfile._id,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);

    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};
