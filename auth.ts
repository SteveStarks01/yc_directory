import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, getUserPermissions } from "@/lib/permissions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Enhanced error handling for NextAuth.js v5 beta
  logger: {
    error: (code, metadata) => {
      // Handle specific NextAuth.js v5 beta errors
      if (code && typeof code === 'string') {
        if (code.includes('JWT') || code.includes('session') || code.includes('OAUTH')) {
          console.warn('NextAuth.js v5 beta warning:', code);
          return; // Don't throw errors for known beta issues
        }
      }
      if (code && typeof code === 'object' && code.type) {
        if (code.type.includes('JWT') || code.type.includes('Session') || code.type.includes('OAUTH')) {
          console.warn('NextAuth.js v5 beta warning:', code.type);
          return; // Don't throw errors for known beta issues
        }
      }
      console.error('NextAuth.js error:', code, metadata);
    },
    warn: (code) => {
      // Suppress beta warnings in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('NextAuth.js warning:', code);
      }
    },
  },
  callbacks: {
    async signIn({
      user: { name, email, image },
      profile: { id, login, bio },
    }) {
      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
          id,
        });

      if (!existingUser) {
        // Create author record
        await writeClient.create({
          _type: "author",
          id,
          name,
          username: login,
          email,
          image,
          bio: bio || "",
        });

        // Create user profile record for community features
        await writeClient.create({
          _type: "userProfile",
          userId: id.toString(),
          role: Role.USER, // Default role for new users
          bio: bio || "",
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isVerified: false,
          isActive: true,
          preferences: {
            emailNotifications: true,
            profileVisibility: "community",
            showEmail: false,
          },
        });
      }

      return true;
    },
    async jwt({ token, account, profile, user }) {
      try {
        // Enhanced JWT handling for NextAuth.js v5 beta
        if (account && profile) {
          const existingUser = await client
            .withConfig({ useCdn: false })
            .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
              id: profile?.id,
            });

          if (existingUser) {
            token.id = existingUser._id;

            // Fetch user profile for role and permissions with error handling
            try {
              const userProfile = await client
                .withConfig({ useCdn: false })
                .fetch(
                  `*[_type == "userProfile" && userId == $userId][0]`,
                  { userId: profile?.id?.toString() }
                );

              if (userProfile) {
                token.role = userProfile.role;
                token.permissions = getUserPermissions(userProfile.role);
              } else {
                // Set default values if profile not found
                token.role = Role.USER;
                token.permissions = getUserPermissions(Role.USER);
              }
            } catch (profileError) {
              console.warn('Failed to fetch user profile in JWT callback:', profileError);
              // Set default values on error
              token.role = Role.USER;
              token.permissions = getUserPermissions(Role.USER);
            }
          } else {
            console.warn('User not found in JWT callback for profile ID:', profile?.id);
          }
        }

        // Ensure token always has required fields
        if (!token.id && user?.id) {
          token.id = user.id;
        }
        if (!token.role) {
          token.role = Role.USER;
        }
        if (!token.permissions) {
          token.permissions = getUserPermissions(token.role || Role.USER);
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        // Return token with minimal safe data on error
        return {
          ...token,
          role: token.role || Role.USER,
          permissions: token.permissions || getUserPermissions(Role.USER),
        };
      }
    },
    async session({ session, token }) {
      try {
        // Enhanced session handling for NextAuth.js v5 beta
        if (!session || !session.user) {
          console.warn('Invalid session object in session callback');
          return session;
        }

        // Safely assign token data to session
        const enhancedSession = {
          ...session,
          id: token.id || session.user.id,
          user: {
            ...session.user,
            id: token.id || session.user.id, // Ensure user.id is always present
            role: token.role || Role.USER,
            permissions: token.permissions || getUserPermissions(token.role || Role.USER),
          }
        };

        return enhancedSession;
      } catch (error) {
        console.error('Session callback error:', error);
        // Return session with minimal safe data on error
        return {
          ...session,
          user: {
            ...session.user,
            id: session.user?.id || token.id,
            role: Role.USER,
            permissions: getUserPermissions(Role.USER),
          }
        };
      }
    },
  },
});
