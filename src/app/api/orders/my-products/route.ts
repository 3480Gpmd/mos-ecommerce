import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Prodotti acquistati precedentemente dal cliente, ordinati per frequenza
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);

    // Raggruppa per prodotto: frequenza, quantità totale, ultimo acquisto, ultimo prezzo
    const purchasedProducts = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        productCode: orderItems.productCode,
        totalQty: sql<number>`SUM(${orderItems.qty})`,
        orderCount: sql<number>`COUNT(DISTINCT ${orderItems.orderId})`,
        lastPurchaseDate: sql<string>`MAX(${orders.createdAt})::text`,
        lastPrice: sql<string>`(ARRAY_AGG(${orderItems.priceUnit}::text ORDER BY ${orders.createdAt} DESC))[1]`,
        // Dati prodotto corrente
        currentPrice: products.priceNet,
        imageUrl: products.imageUrl,
        unit: products.unit,
        stockAvailable: products.stockAvailable,
        isActive: products.isActive,
        brand: products.brand,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.customerId, customerId))
      .groupBy(
        orderItems.productId,
        orderItems.productName,
        orderItems.productCode,
        products.priceNet,
        products.imageUrl,
        products.unit,
        products.stockAvailable,
        products.isActive,
        products.brand,
      )
      .orderBy(desc(sql`COUNT(DISTINCT ${orderItems.orderId})`))
      .limit(50);

    // Ultimo ordine completo per "riordina ultimo ordine"
    const [lastOrder] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    let lastOrderItems: { productId: number | null; productName: string; qty: number; priceUnit: string; productCode: string }[] = [];
    if (lastOrder) {
      lastOrderItems = await db
        .select({
          productId: orderItems.productId,
          productName: orderItems.productName,
          productCode: orderItems.productCode,
          qty: orderItems.qty,
          priceUnit: sql<string>`${orderItems.priceUnit}::text`,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, lastOrder.id));
    }

    return NextResponse.json({
      products: purchasedProducts,
      lastOrder: lastOrder ? {
        ...lastOrder,
        items: lastOrderItems,
      } : null,
    });
  } catch (err) {
    console.error('🔴 GET /api/orders/my-products error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
