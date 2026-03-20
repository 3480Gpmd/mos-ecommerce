import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers, cartItems, products, crmSyncQueue, giftRules } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { generateOrderNumber } from '@/lib/utils';
import { sendEmail, getAdminEmail, orderConfirmationCustomerEmail, newOrderAdminEmail } from '@/lib/email';
import { generateEasyfattExcel } from '@/lib/easyfatt-excel';

const createOrderSchema = z.object({
  shippingAddress: z.string().min(1),
  shippingPostcode: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingProvince: z.string().min(1).max(2),
  paymentMethod: z.enum(['paypal', 'teamsystem', 'bonifico']),
  notes: z.string().optional(),
  selectedGiftRuleId: z.number().optional(),
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

    // Check selected gift rule (customer chose this gift in checkout)
    const giftItemsData: typeof itemsData = [];
    if (parsed.data.selectedGiftRuleId) {
      const [selectedRule] = await db
        .select()
        .from(giftRules)
        .where(and(eq(giftRules.id, parsed.data.selectedGiftRuleId), eq(giftRules.isActive, true)))
        .limit(1);

      if (selectedRule) {
        // Verify the gift rule is still applicable
        const now = new Date();
        const cartProductIds = cart.map(({ product: p }) => p.id);
        const cartCategoryIds = cart.map(({ product: p }) => p.categoryId).filter(Boolean) as number[];
        let ruleValid = true;

        if (selectedRule.startDate && new Date(selectedRule.startDate) > now) ruleValid = false;
        if (selectedRule.endDate && new Date(selectedRule.endDate) < now) ruleValid = false;
        if (selectedRule.minOrderAmount && subtotal < parseFloat(String(selectedRule.minOrderAmount))) ruleValid = false;

        if (ruleValid) {
          switch (selectedRule.triggerType) {
            case 'amount':
              ruleValid = !!selectedRule.triggerValue && subtotal >= parseFloat(String(selectedRule.triggerValue));
              break;
            case 'product':
              ruleValid = !!selectedRule.triggerProductId && cartProductIds.includes(selectedRule.triggerProductId);
              break;
            case 'category':
              ruleValid = !!selectedRule.triggerCategoryId && cartCategoryIds.includes(selectedRule.triggerCategoryId);
              break;
            default:
              ruleValid = false;
          }
        }

        if (ruleValid) {
          const [giftProduct] = await db.select().from(products).where(eq(products.id, selectedRule.giftProductId)).limit(1);
          if (giftProduct) {
            giftItemsData.push({
              productId: giftProduct.id,
              productCode: giftProduct.code,
              productName: `[OMAGGIO] ${giftProduct.name}`,
              productBrand: giftProduct.brand,
              unit: giftProduct.unit || 'PZ',
              qty: selectedRule.giftQty,
              priceUnit: '0',
              discountPct: '100',
              vatPct: String(parseFloat(String(giftProduct.vatCode))),
              lineTotal: '0',
              isUrgent: false,
            });
          }
        }
      }
    }

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

    // Create order items (cart items + gift items)
    const allItems = [...itemsData, ...giftItemsData];
    await db.insert(orderItems).values(
      allItems.map((item) => ({
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

    // Prepara dati email
    const customerName = customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;
    const emailItems = allItems.map((item) => ({
      code: item.productCode || '',
      name: item.productName || '',
      qty: item.qty,
      priceNet: item.priceUnit,
      unit: item.unit,
      vatPct: item.vatPct,
    }));

    // 1. Email ringraziamento al cliente
    const customerEmailTemplate = orderConfirmationCustomerEmail({
      customerName,
      orderNumber,
      items: emailItems,
      subtotal: String(subtotal.toFixed(2)),
      vatAmount: String(vatAmount.toFixed(2)),
      shippingCost: String(shippingCost.toFixed(2)),
      total: String(total.toFixed(2)),
      paymentMethod: parsed.data.paymentMethod,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
    });
    sendEmail({ to: customer.email, ...customerEmailTemplate }).catch(console.error);

    // 2. Email admin con Excel Easyfatt allegato
    const adminEmailTemplate = newOrderAdminEmail({
      orderNumber,
      customerName,
      customerEmail: customer.email,
      items: emailItems,
      subtotal: String(subtotal.toFixed(2)),
      vatAmount: String(vatAmount.toFixed(2)),
      shippingCost: String(shippingCost.toFixed(2)),
      total: String(total.toFixed(2)),
      paymentMethod: parsed.data.paymentMethod,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
      notes: parsed.data.notes,
      isUrgent: parsed.data.isUrgent,
    });

    // Genera Excel Easyfatt e allegalo
    try {
      const excelBuffer = await generateEasyfattExcel(emailItems);
      await sendEmail({
        to: getAdminEmail(),
        ...adminEmailTemplate,
        attachments: [{ filename: `ordine-${orderNumber}.xlsx`, content: excelBuffer }],
      });
    } catch (emailErr) {
      console.error('🔴 Errore invio email admin ordine:', emailErr);
      // Non blocca la creazione ordine
    }

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err: unknown) {
    console.error('🔴 POST /api/orders error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
