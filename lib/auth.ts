import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/prismadb";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "mongodb" }),
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 604800,
    updateAge: 86400,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github", "google"], // Add provider here
    },
  },
});

export type { Session, User } from "better-auth";
