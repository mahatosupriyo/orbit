import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/server/db"
import GoogleProvider from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],

    // secret: process.env.NEXTAUTH_SECRET,

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