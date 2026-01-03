import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import client from "@/app/db";
export const NEXT_AUTH_CONFIG: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            const existingUser = await client.user.findUnique({
                where: { email: user.email },
            });

            if (!existingUser) {
                await client.user.create({
                    data: {
                        name: user.name ?? "No Name",
                        email: user.email,
                    },
                });
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user?.email) {
                const dbuser = await client.user.findUnique({
                    where: { email: user.email },
                });
                token.uid = dbuser?.id;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.uid;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/user/signin",
    },
};
