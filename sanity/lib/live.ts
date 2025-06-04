import "server-only";

import { defineLive } from "next-sanity";
import { client } from "@/sanity/lib/client";

// Get the read token from environment variables
const token = process.env.SANITY_API_READ_TOKEN;

// Configure Sanity Live with proper error handling
// If no token is provided, live features will be disabled but the app will still work
export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Only provide tokens if they exist to avoid connection errors
  ...(token && {
    serverToken: token,
    browserToken: token, // In production, use a token with Viewer rights only
  }),
});
