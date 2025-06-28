import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { createClient } from "@/sanity/lib/client";
import { SanityAdapter } from "next-auth-sanity";

export const authOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  adapter: SanityAdapter(createClient()),
  callbacks: {
    session: async ({ session, token }) => {
      if (token) {
        session.id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);