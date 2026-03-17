import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase();
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
    async signIn({ user, account }) {
      // Per login OAuth (Google/Apple), crea o collega il customer
      if (account?.provider === 'google' || account?.provider === 'apple') {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const [existing] = await db
          .select()
          .from(customers)
          .where(eq(customers.email, email))
          .limit(1);

        if (existing) {
          // Utente esiste già — aggiorna provider OAuth se non impostato
          if (!existing.oauthProvider) {
            await db.update(customers)
              .set({
                oauthProvider: account.provider,
                oauthId: account.providerAccountId,
              })
              .where(eq(customers.id, existing.id));
          }

          // Controlla attivazione (non-admin)
          if (existing.role !== 'admin' && !existing.isActive) {
            return '/login?error=ACCOUNT_INACTIVE';
          }

          // Imposta l'id per il JWT callback
          user.id = String(existing.id);
          (user as Record<string, unknown>).customerType = existing.customerType;
          (user as Record<string, unknown>).role = existing.role;
          (user as Record<string, unknown>).isAdmin = existing.role === 'admin';
        } else {
          // Crea nuovo customer (privato, attivo subito)
          const nameParts = (user.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const [newCustomer] = await db.insert(customers).values({
            email,
            firstName,
            lastName,
            customerType: 'privato',
            oauthProvider: account.provider,
            oauthId: account.providerAccountId,
            isActive: true,
            role: 'customer',
          }).returning();

          user.id = String(newCustomer.id);
          (user as Record<string, unknown>).customerType = 'privato';
          (user as Record<string, unknown>).role = 'customer';
          (user as Record<string, unknown>).isAdmin = false;
        }
      }
      return true;
    },
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
