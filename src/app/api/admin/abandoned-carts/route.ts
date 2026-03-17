import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, cartItems, products, cartAbandonmentEmails } from '@/db/schema';
import { eq, desc, sql, ilike, or, and, count, gt, gte } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false as const, error: 'Non autenticato', status: 401 };
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) {
    return { authorized: false as const, error: 'Accesso negato', status: 403 };
  }
  return { authorized: true as const };
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    // Get current time minus 2 hours (120 minutes) to find abandoned carts
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Build search conditions
    const conditions = [];
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(customers.firstName, pattern),
          ilike(customers.lastName, pattern),
          ilike(customers.email, pattern),
          ilike(customers.companyName, pattern)
        )
      );
    }

    // Add condition: cart items updated more than 2 hours ago
    conditions.push(lt(cartItems.updatedAt, twoHoursAgo));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total abandoned carts
    const [{ total: totalCount }] = await db
      .select({ total: count(cartItems.id) })
      .from(cartItems)
      .innerJoin(customers, eq(cartItems.customerId, customers.id))
      .where(where);

    // Get abandoned carts with customer info and stats
    const abandonedCarts = await db
      .select({
        customerId: customers.id,
        customerName: sql<string>`COALESCE(${customers.companyName}, CONCAT(COALESCE(${customers.firstName}, ''), ' ', COALESCE(${customers.lastName}, '')))`,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        customerCompany: customers.companyName,
        itemCount: sql<number>`COUNT(${cartItems.id})`,
        cartTotal: sql<string>`COALESCE(SUM((${cartItems.qty} * CAST(${products.priceNet} AS numeric))::numeric), 0)`,
        lastCartUpdate: sql<string>`MAX(${cartItems.updatedAt})`,
        emailSent: sql<boolean>`EXISTS(SELECT 1 FROM ${cartAbandonmentEmails} WHERE customer_id = ${customers.id} AND email_type = 'customer_reminder' AND sent_at > NOW() - INTERVAL '24 hours')`,
      })
      .from(cartItems)
      .innerJoin(customers, eq(cartItems.customerId, customers.id))
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(where)
      .groupBy(customers.id, customers.firstName, customers.lastName, customers.email, customers.phone, customers.companyName)
      .orderBy(desc(sql`MAX(${cartItems.updatedAt})`))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      carts: abandonedCarts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/abandoned-carts error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'ID cliente obbligatorio' }, { status: 400 });
    }

    // Record the email send attempt
    const [result] = await db
      .insert(cartAbandonmentEmails)
      .values({
        customerId: parseInt(customerId),
        emailType: 'customer_reminder',
        sentAt: new Date(),
      })
      .returning();

    if (!result) {
      return NextResponse.json({ error: 'Errore nel salvataggio' }, { status: 500 });
    }

    // In a real implementation, you would send an email via Resend here
    // await resend.emails.send({
    //   from: 'noreply@mos.com',
    //   to: customer.email,
    //   subject: 'Hai abbandonato un carrello!',
    //   html: '...'
    // });

    return NextResponse.json({
      success: true,
      message: 'Email di promemoria registrata',
    });
  } catch (error) {
    console.error('POST /api/admin/abandoned-carts error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'ID cliente obbligatorio' }, { status: 400 });
    }

    // Delete all cart items for this customer
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.customerId, parseInt(customerId)));

    return NextResponse.json({
      success: true,
      message: 'Carrello svuotato',
    });
  } catch (error) {
    console.error('DELETE /api/admin/abandoned-carts error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// Helper to fix import issue
import { lt } from 'drizzle-orm';
