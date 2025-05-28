import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/server/db"
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
    ],
    
    callbacks: {
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