import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supplierOrders, supplierSettings, orders, orderItems, customers } from '@/db/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { sendSupplierOrderEmail } from '@/lib/supplier-email';

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

const createSupplierOrderSchema = z.object({
  orderId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  deliveryType: z.enum(['drop_ship', 'sede_mos']),
  notes: z.string().optional(),
});

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
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status && ['pending', 'sent', 'failed'].includes(status)) {
      conditions.push(eq(supplierOrders.emailStatus, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [{ total: totalCount }] = await db
      .select({ total: count() })
      .from(supplierOrders)
      .where(where);

    // Fetch supplier orders with related data
    const result = await db
      .select({
        id: supplierOrders.id,
        orderId: supplierOrders.orderId,
        orderNumber: orders.orderNumber,
        supplierId: supplierOrders.supplierId,
        supplierName: supplierSettings.name,
        supplierEmail: supplierOrders.supplierEmail,
        deliveryType: supplierOrders.deliveryType,
        emailStatus: supplierOrders.emailStatus,
        emailSentAt: supplierOrders.emailSentAt,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        notes: supplierOrders.notes,
        createdAt: supplierOrders.createdAt,
        updatedAt: supplierOrders.updatedAt,
        itemCount: sql<number>`(SELECT COUNT(*) FROM order_items WHERE order_id = ${supplierOrders.orderId})`,
      })
      .from(supplierOrders)
      .innerJoin(orders, eq(supplierOrders.orderId, orders.id))
      .leftJoin(supplierSettings, eq(supplierOrders.supplierId, supplierSettings.id))
      .where(where)
      .orderBy(desc(supplierOrders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      supplierOrders: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/supplier-orders error:', error);
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
    const parsed = createSupplierOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify order exists
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parsed.data.orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
    }

    // Verify supplier exists
    const [supplier] = await db
      .select()
      .from(supplierSettings)
      .where(eq(supplierSettings.id, parsed.data.supplierId))
      .limit(1);

    if (!supplier) {
      return NextResponse.json({ error: 'Fornitore non trovato' }, { status: 404 });
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, parsed.data.orderId));

    if (items.length === 0) {
      return NextResponse.json({ error: 'Ordine senza articoli' }, { status: 400 });
    }

    // Get customer for delivery address
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, order.customerId))
      .limit(1);

    // Create supplier order
    const [supplierOrder] = await db
      .insert(supplierOrders)
      .values({
        orderId: parsed.data.orderId,
        supplierId: parsed.data.supplierId,
        deliveryType: parsed.data.deliveryType,
        dropShipName: parsed.data.deliveryType === 'drop_ship' ? order.customerName : null,
        dropShipAddress: parsed.data.deliveryType === 'drop_ship' ? order.shippingAddress : null,
        dropShipPostcode: parsed.data.deliveryType === 'drop_ship' ? order.shippingPostcode : null,
        dropShipCity: parsed.data.deliveryType === 'drop_ship' ? order.shippingCity : null,
        dropShipProvince: parsed.data.deliveryType === 'drop_ship' ? order.shippingProvince : null,
        supplierEmail: supplier.email,
        notes: parsed.data.notes || null,
        emailStatus: 'pending',
      })
      .returning();

    // Prepare items for email
    const emailItems = items.map((item) => ({
      code: item.productCode || '',
      name: item.productName || '',
      brand: item.productBrand || '',
      qty: item.qty,
      unit: item.unit || 'PZ',
      priceNet: String(item.priceUnit),
      vatPct: String(item.vatPct),
    }));

    // Send email to supplier
    const emailResult = await sendSupplierOrderEmail({
      supplierId: parsed.data.supplierId,
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      orderNumber: order.orderNumber,
      customerName: order.customerName || customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Cliente',
      customerEmail: order.customerEmail || customer?.email || '',
      items: emailItems,
      deliveryType: parsed.data.deliveryType,
      deliveryAddress: order.shippingAddress || undefined,
      deliveryPostcode: order.shippingPostcode || undefined,
      deliveryCity: order.shippingCity || undefined,
      deliveryProvince: order.shippingProvince || undefined,
      notes: order.notes || parsed.data.notes || null,
    });

    // Update supplier order status based on email result
    if (emailResult.success) {
      await db
        .update(supplierOrders)
        .set({
          emailStatus: 'sent',
          emailSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(supplierOrders.id, supplierOrder.id));

      // Update order to mark as supplier forwarded
      await db
        .update(orders)
        .set({
          supplierForwarded: true,
          supplierForwardedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parsed.data.orderId));

      console.log(`📧 Supplier order email sent for order ${order.orderNumber} to ${supplier.email}`);
    } else {
      await db
        .update(supplierOrders)
        .set({
          emailStatus: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(supplierOrders.id, supplierOrder.id));

      console.error(`🔴 Failed to send supplier order email for order ${order.orderNumber}`);
    }

    return NextResponse.json(
      {
        supplierOrder: {
          ...supplierOrder,
          emailStatus: emailResult.success ? 'sent' : 'failed',
          emailSentAt: emailResult.success ? new Date() : null,
        },
        emailStatus: emailResult.success ? 'sent' : 'failed',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/supplier-orders error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
