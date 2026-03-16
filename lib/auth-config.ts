import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';
import { Session } from 'next-auth';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (user && session.user) {
        try {
          await connectDB();
          const dbUser = await User.findById(user.id);
          (session.user as any).id = user.id;
          (session.user as any).isPremium = dbUser?.isPremium || false;
          (session.user as any).premiumExpiry = dbUser?.premiumExpiry;
        } catch (error) {
          console.error('Session callback DB error:', error);
          // Still set the id even if DB fails
          (session.user as any).id = user.id;
          (session.user as any).isPremium = false;
        }
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);