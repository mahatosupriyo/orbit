import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/server/db"
import GitHub from "next-auth/providers/github";

/**
 * NextAuth configuration
 * - Uses PrismaAdapter for database integration.
 * - Configures GitHub as the authentication provider.
 * - Adds custom session callback to include user ID in the session.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
    ],
    
    callbacks: {
        /**
         * Custom session callback
         * - Adds the user's ID to the session object for client access.
         */
        session: ({
            session,
            user,
        }: {
            session: any;
            user: { id: string };
        }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
    },
})