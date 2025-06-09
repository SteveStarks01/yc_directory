import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, token } from "../env";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  requestTagPrefix: 'yc-directory',
  perspective: 'published',
  studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
});

if (!writeClient.config().token) {
  throw new Error("Write token not found.");
}
