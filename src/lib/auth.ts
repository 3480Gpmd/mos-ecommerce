import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const [customer] = await db
          .select()
          .from(customers)
          .where(eq(customers.email, email))
          .limit(1);

        if (!customer) return null;

        // Se l'utente si è registrato solo via OAuth, non ha password
        if (!customer.passwordHash) return null;

        const valid = await bcrypt.compare(password, customer.passwordHash);
        if (!valid) return null;

        // Non-admin customers must be activated by admin
        if (customer.role !== 'admin' && !customer.isActive) {
          throw new Error('ACCOUNT_INACTIVE');
        }

        return {
          id: String(customer.id),
          email: customer.email,
          name: customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          customerType: customer.customerType,
          role: customer.role,
          isAdmin: customer.role === 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.customerId = user.id;
        token.customerType = (user as { customerType?: string }).customerType || 'privato';
        token.role = (user as { role?: string }).role || 'customer';
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.customerId as string;
        (session.user as { customerType?: string }).customerType = token.customerType as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
