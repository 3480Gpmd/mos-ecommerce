import { NextResponse } from 'next/server';
import { db } from '@/db';
import { giftRules, cartItems, products } from '@/db/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ gifts: [] });
    }

    const customerId = parseInt(session.user.id);

    // Fetch cart items with product info
    const cart = await db
      .select({
        productId: cartItems.productId,
        qty: cartItems.qty,
        priceNet: products.priceNet,
        categoryId: products.categoryId,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.customerId, customerId));

    if (cart.length === 0) {
      return NextResponse.json({ gifts: [] });
    }

    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => {
      return sum + parseFloat(String(item.priceNet)) * item.qty;
    }, 0);

    const cartProductIds = cart.map((i) => i.productId);
    const cartCategoryIds = cart.map((i) => i.categoryId).filter(Boolean) as number[];

    const now = new Date();

    // Fetch all active gift rules
    const rules = await db
      .select({
        id: giftRules.id,
        name: giftRules.name,
        triggerType: giftRules.triggerType,
        triggerValue: giftRules.triggerValue,
        triggerProductId: giftRules.triggerProductId,
        triggerCategoryId: giftRules.triggerCategoryId,
        giftProductId: giftRules.giftProductId,
        giftQty: giftRules.giftQty,
        minOrderAmount: giftRules.minOrderAmount,
        startDate: giftRules.startDate,
        endDate: giftRules.endDate,
        giftProductName: sql<string>`(SELECT ${products.name} FROM ${products} WHERE ${products.id} = ${giftRules.giftProductId})`.as('gift_name'),
        giftProductImage: sql<string>`(SELECT ${products.imageUrl} FROM ${products} WHERE ${products.id} = ${giftRules.giftProductId})`.as('gift_image'),
        giftProductCode: sql<string>`(SELECT ${products.code} FROM ${products} WHERE ${products.id} = ${giftRules.giftProductId})`.as('gift_code'),
      })
      .from(giftRules)
      .where(eq(giftRules.isActive, true));

    // Filter applicable rules
    const applicableGifts = rules.filter((rule) => {
      // Check date range
      if (rule.startDate && new Date(rule.startDate) > now) return false;
      if (rule.endDate && new Date(rule.endDate) < now) return false;

      // Check min order amount
      if (rule.minOrderAmount && subtotal < parseFloat(String(rule.minOrderAmount))) return false;

      // Check trigger
      switch (rule.triggerType) {
        case 'amount':
          return rule.triggerValue && subtotal >= parseFloat(String(rule.triggerValue));
        case 'product':
          return rule.triggerProductId && cartProductIds.includes(rule.triggerProductId);
        case 'category':
          return rule.triggerCategoryId && cartCategoryIds.includes(rule.triggerCategoryId);
        default:
          return false;
      }
    });

    const gifts = applicableGifts.map((g) => ({
      ruleId: g.id,
      ruleName: g.name,
      triggerType: g.triggerType,
      triggerValue: g.triggerValue,
      giftProductId: g.giftProductId,
      giftProductName: g.giftProductName,
      giftProductImage: g.giftProductImage,
      giftProductCode: g.giftProductCode,
      giftQty: g.giftQty,
    }));

    return NextResponse.json({ gifts, subtotal });
  } catch (error) {
    console.error('GET /api/cart/gifts error:', error);
    return NextResponse.json({ gifts: [] });
  }
}
