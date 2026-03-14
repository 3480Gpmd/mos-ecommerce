import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const webhookSchema = z.object({
  event: z.enum(['order_status_update', 'customer_update']),
  orderId: z.number().optional(),
  status: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.CRM_API_KEY) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = webhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 });
    }

    const { event, orderId, status } = parsed.data;

    if (event === 'order_status_update' && orderId && status) {
      await db.update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      console.log(`🔵 CRM webhook: ordine ${orderId} → stato ${status}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('🔴 POST /api/crm-webhook error:', err);
    return NextResponse.json({ error: 'Errore webhook' }, { status: 500 });
  }
}
