import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers } from '@/db/schema';
import { eq, desc, sql, ilike, or, and, gte, lte, count } from 'drizzle-orm';
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
    const id = searchParams.get('id');

    // ── Single order detail ──
    if (id) {
      const orderId = parseInt(id);

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
      }

      // Order items
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))
        .orderBy(orderItems.id);

      // Customer details
      const [customer] = await db
        .select({
          id: customers.id,
          email: customers.email,
          firstName: customers.firstName,
          lastName: customers.lastName,
          companyName: customers.companyName,
          customerType: customers.customerType,
          vatNumber: customers.vatNumber,
          fiscalCode: customers.fiscalCode,
          sdiCode: customers.sdiCode,
          pecEmail: customers.pecEmail,
          phone: customers.phone,
          address: customers.address,
          postcode: customers.postcode,
          city: customers.city,
          province: customers.province,
          priceList: customers.priceList,
        })
        .from(customers)
        .where(eq(customers.id, order.customerId))
        .limit(1);

      return NextResponse.json({
        order,
        items,
        customer: customer || null,
      });
    }

    // ── List orders with filters & pagination ──
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, pattern),
          ilike(orders.customerName, pattern),
          ilike(orders.customerEmail, pattern)
        )
      );
    }

    if (dateFrom) {
      conditions.push(gte(orders.createdAt, new Date(dateFrom)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(orders.createdAt, endDate));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [{ total: totalCount }] = await db
      .select({ total: count() })
      .from(orders)
      .where(where);

    // Fetch orders with item count
    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerId: orders.customerId,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        subtotal: orders.subtotal,
        vatAmount: orders.vatAmount,
        shippingCost: orders.shippingCost,
        total: orders.total,
        easyfattExported: orders.easyfattExported,
        createdAt: orders.createdAt,
        itemCount: sql<number>`(SELECT COUNT(*) FROM order_items WHERE order_id = ${orders.id})`,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Summary stats (unfiltered for the top bar)
    const [summaryStats] = await db
      .select({
        totalOrders: count(orders.id),
        totalRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
        todayOrders: sql<number>`COUNT(*) FILTER (WHERE ${orders.createdAt}::date = CURRENT_DATE)`,
        todayRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric) FILTER (WHERE ${orders.createdAt}::date = CURRENT_DATE), 0)`,
      })
      .from(orders);

    return NextResponse.json({
      orders: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalOrders: summaryStats?.totalOrders ?? 0,
        totalRevenue: summaryStats?.totalRevenue ?? '0',
        todayOrders: summaryStats?.todayOrders ?? 0,
        todayRevenue: summaryStats?.todayRevenue ?? '0',
      },
    });
  } catch (error) {
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { id, status, adminNotes, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID ordine obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (status !== undefined) {
      const validStatuses = ['nuovo', 'confermato', 'in_preparazione', 'spedito', 'consegnato', 'annullato'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Stato non valido' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['pending', 'paid', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: 'Stato pagamento non valido' }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
    }

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('PUT /api/admin/orders error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
