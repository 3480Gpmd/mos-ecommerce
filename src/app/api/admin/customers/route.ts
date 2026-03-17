import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, orders, orderItems, priceLists } from '@/db/schema';
import { eq, desc, sql, ilike, or, and, count } from 'drizzle-orm';
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

    // ── Single customer detail ──
    if (id) {
      const customerId = parseInt(id);

      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      if (!customer) {
        return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
      }

      // Order stats
      const [stats] = await db
        .select({
          totalOrders: count(orders.id),
          totalSpent: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
          lastOrder: sql<string>`MAX(${orders.createdAt})`,
        })
        .from(orders)
        .where(eq(orders.customerId, customerId));

      // Recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          total: orders.total,
          createdAt: orders.createdAt,
          itemCount: sql<number>`(SELECT COUNT(*) FROM order_items WHERE order_id = ${orders.id})`,
        })
        .from(orders)
        .where(eq(orders.customerId, customerId))
        .orderBy(desc(orders.createdAt))
        .limit(10);

      // Top purchased products
      const topProducts = await db
        .select({
          productCode: orderItems.productCode,
          productName: orderItems.productName,
          totalQty: sql<number>`SUM(${orderItems.qty})`,
          totalSpent: sql<string>`SUM(${orderItems.lineTotal}::numeric)`,
          orderCount: sql<number>`COUNT(DISTINCT ${orderItems.orderId})`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orders.customerId, customerId))
        .groupBy(orderItems.productCode, orderItems.productName)
        .orderBy(sql`SUM(${orderItems.qty}) DESC`)
        .limit(10);

      // Available price lists
      const allPriceLists = await db
        .select({
          id: priceLists.id,
          code: priceLists.code,
          name: priceLists.name,
        })
        .from(priceLists)
        .where(eq(priceLists.isActive, true));

      return NextResponse.json({
        customer: {
          ...customer,
          passwordHash: undefined,
        },
        stats: {
          totalOrders: stats?.totalOrders ?? 0,
          totalSpent: stats?.totalSpent ?? '0',
          lastOrder: stats?.lastOrder ?? null,
        },
        recentOrders,
        topProducts,
        priceLists: allPriceLists,
      });
    }

    // ── List customers with search & pagination ──
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(customers.firstName, pattern),
          ilike(customers.lastName, pattern),
          ilike(customers.email, pattern),
          ilike(customers.companyName, pattern),
          ilike(customers.vatNumber, pattern)
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [{ total: totalCount }] = await db
      .select({ total: count() })
      .from(customers)
      .where(where);

    // Fetch customers with order stats in a subquery
    const result = await db
      .select({
        id: customers.id,
        email: customers.email,
        firstName: customers.firstName,
        lastName: customers.lastName,
        companyName: customers.companyName,
        customerType: customers.customerType,
        vatNumber: customers.vatNumber,
        priceList: customers.priceList,
        isActive: customers.isActive,
        role: customers.role,
        phone: customers.phone,
        city: customers.city,
        province: customers.province,
        createdAt: customers.createdAt,
        totalOrders: sql<number>`(SELECT COUNT(*) FROM orders WHERE customer_id = ${customers.id})`,
        totalSpent: sql<string>`(SELECT COALESCE(SUM(total::numeric), 0) FROM orders WHERE customer_id = ${customers.id})`,
        lastOrder: sql<string>`(SELECT MAX(created_at) FROM orders WHERE customer_id = ${customers.id})`,
      })
      .from(customers)
      .where(where)
      .orderBy(desc(customers.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      customers: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/customers error:', error);
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID cliente obbligatorio' }, { status: 400 });
    }

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    const editableKeys = [
      'priceList', 'customerType', 'firstName', 'lastName',
      'companyName', 'vatNumber', 'fiscalCode', 'sdiCode',
      'pecEmail', 'phone', 'address', 'postcode', 'city',
      'province', 'easyfattCode', 'birthDate', 'isActive', 'role',
    ];

    for (const key of editableKeys) {
      if (key in data) {
        allowedFields[key] = data[key];
      }
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    allowedFields.updatedAt = new Date();

    const [updated] = await db
      .update(customers)
      .set(allowedFields)
      .where(eq(customers.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    return NextResponse.json({
      customer: { ...updated, passwordHash: undefined },
    });
  } catch (error) {
    console.error('PUT /api/admin/customers error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
