import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers, cartItems, products, crmSyncQueue } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { generateOrderNumber } from '@/lib/utils';

const createOrderSchema = z.object({
  shippingAddress: z.string().min(1),
  shippingPostcode: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingProvince: z.string().min(1).max(2),
  paymentMethod: z.enum(['paypal', 'teamsystem', 'bonifico']),
  notes: z.string().optional(),
  isUrgent: z.boolean().optional().default(false),
  altShipping: z.boolean().optional().default(false),
  altShippingName: z.string().optional(),
  altShippingAddress: z.string().optional(),
  altShippingPostcode: z.string().optional(),
  altShippingCity: z.string().optional(),
  altShippingProvince: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);
    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const status = req.nextUrl.searchParams.get('status');

    const conditions = isAdmin ? [] : [eq(orders.customerId, customerId)];
    if (status) conditions.push(eq(orders.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({ orders: result });
  } catch (err: unknown) {
    console.error('🔴 GET /api/orders error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 });
    }

    // Get customer
    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!customer) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    // Get cart items with product details
    const cart = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.customerId, customerId));

    if (cart.length === 0) {
      return NextResponse.json({ error: 'Carrello vuoto' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    let vatAmount = 0;
    const itemsData = cart.map(({ cartItem, product }) => {
      const priceNet = parseFloat(String(product.priceNet));
      const vatPct = parseFloat(String(product.vatCode));
      const lineTotal = priceNet * cartItem.qty;
      const lineVat = lineTotal * (vatPct / 100);
      subtotal += lineTotal;
      vatAmount += lineVat;

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        productBrand: product.brand,
        unit: product.unit || 'PZ',
        qty: cartItem.qty,
        priceUnit: String(priceNet),
        discountPct: '0',
        vatPct: String(vatPct),
        lineTotal: String(lineTotal.toFixed(2)),
        isUrgent: cartItem.isUrgent,
      };
    });

    const shippingCost = subtotal >= 100 ? 0 : 8.90;
    const total = subtotal + vatAmount + shippingCost;

    const orderNumber = generateOrderNumber();

    // Create order
    const [order] = await db.insert(orders).values({
      orderNumber,
      customerId,
      customerName: customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      customerEmail: customer.email,
      customerVat: customer.vatNumber,
      customerFiscal: customer.fiscalCode,
      shippingAddress: parsed.data.shippingAddress,
      shippingPostcode: parsed.data.shippingPostcode,
      shippingCity: parsed.data.shippingCity,
      shippingProvince: parsed.data.shippingProvince,
      subtotal: String(subtotal.toFixed(2)),
      vatAmount: String(vatAmount.toFixed(2)),
      shippingCost: String(shippingCost.toFixed(2)),
      total: String(total.toFixed(2)),
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: 'pending',
      status: 'nuovo',
      notes: parsed.data.notes || null,
      isUrgent: parsed.data.isUrgent,
      altShipping: parsed.data.altShipping,
      altShippingName: parsed.data.altShippingName || null,
      altShippingAddress: parsed.data.altShippingAddress || null,
      altShippingPostcode: parsed.data.altShippingPostcode || null,
      altShippingCity: parsed.data.altShippingCity || null,
      altShippingProvince: parsed.data.altShippingProvince || null,
    }).returning();

    // Create order items
    await db.insert(orderItems).values(
      itemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }))
    );

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));

    // Queue CRM sync
    await db.insert(crmSyncQueue).values([
      {
        entityType: 'customer',
        entityId: customerId,
        action: 'sync_customer',
        payload: JSON.stringify({ customerId }),
      },
      {
        entityType: 'order',
        entityId: order.id,
        action: 'sync_order',
        payload: JSON.stringify({ orderId: order.id }),
      },
    ]);

    console.log(`🔵 Ordine ${orderNumber} creato per cliente ${customer.email}`);

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err: unknown) {
    console.error('🔴 POST /api/orders error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
