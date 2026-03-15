import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, customers, products, cartAbandonmentEmails } from '@/db/schema';
import { eq, sql, and, lt, not } from 'drizzle-orm';
import { sendEmail, abandonedCartCustomerEmail, abandonedCartAdminEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Cron job: controlla carrelli abbandonati (item più vecchi di 2 ore)
// Vercel Cron o chiamata manuale con CRON_SECRET
export async function GET(request: NextRequest) {
  // Protezione: accetta solo chiamate con il secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Trova clienti con carrello non vuoto e ultimo aggiornamento > 2 ore fa
    const abandonedCarts = await db
      .select({
        customerId: cartItems.customerId,
        itemCount: sql<number>`count(*)`,
        lastUpdated: sql<string>`MAX(${cartItems.updatedAt})::text`,
      })
      .from(cartItems)
      .groupBy(cartItems.customerId)
      .having(sql`MAX(${cartItems.updatedAt}) < ${twoHoursAgo}`);

    if (abandonedCarts.length === 0) {
      return NextResponse.json({ message: 'Nessun carrello abbandonato', sent: 0 });
    }

    let sentCount = 0;

    for (const cart of abandonedCarts) {
      // Controlla se abbiamo già inviato un'email per questo carrello
      // (evitiamo duplicati - max 1 email ogni 24 ore per cliente)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const alreadySent = await db
        .select({ id: cartAbandonmentEmails.id })
        .from(cartAbandonmentEmails)
        .where(and(
          eq(cartAbandonmentEmails.customerId, cart.customerId),
          sql`${cartAbandonmentEmails.sentAt} > ${oneDayAgo}`
        ))
        .limit(1);

      if (alreadySent.length > 0) continue;

      // Recupera dati cliente
      const [customer] = await db
        .select({
          id: customers.id,
          email: customers.email,
          firstName: customers.firstName,
          lastName: customers.lastName,
          companyName: customers.companyName,
        })
        .from(customers)
        .where(eq(customers.id, cart.customerId))
        .limit(1);

      if (!customer?.email) continue;

      // Recupera prodotti nel carrello
      const cartProducts = await db
        .select({
          name: products.name,
          qty: cartItems.qty,
          priceNet: products.priceNet,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.customerId, cart.customerId));

      const customerName = customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;

      // 1. Email al cliente (promemoria)
      const customerEmail = abandonedCartCustomerEmail(customerName, cartProducts);
      await sendEmail({
        to: customer.email,
        subject: customerEmail.subject,
        html: customerEmail.html,
      });

      // 2. Email all'admin (notifica)
      const adminEmail = abandonedCartAdminEmail(customerName, customer.email, cartProducts);
      await sendEmail({
        to: 'ordini@milanooffreservizi.it',
        subject: adminEmail.subject,
        html: adminEmail.html,
      });

      // Registra invio
      await db.insert(cartAbandonmentEmails).values([
        { customerId: cart.customerId, emailType: 'customer_reminder' },
        { customerId: cart.customerId, emailType: 'admin_notification' },
      ]);

      sentCount++;
    }

    return NextResponse.json({ message: `Email inviate per ${sentCount} carrelli abbandonati`, sent: sentCount });
  } catch (err) {
    console.error('🔴 Cron abandoned cart error:', err);
    return NextResponse.json({ error: 'Errore elaborazione' }, { status: 500 });
  }
}
