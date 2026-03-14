import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const demoCustomers = [
  {
    email: 'mario.rossi@studiomr.it',
    firstName: 'Mario', lastName: 'Rossi',
    companyName: 'Studio Legale Rossi',
    customerType: 'azienda' as const,
    vatNumber: '12345678901', fiscalCode: 'RSSMRA80A01F205X',
    sdiCode: 'M5UXCR1', phone: '02 1234567',
    address: 'Via Montenapoleone 12', postcode: '20121', city: 'Milano', province: 'MI',
  },
  {
    email: 'laura.bianchi@techsrl.com',
    firstName: 'Laura', lastName: 'Bianchi',
    companyName: 'Tech Solutions Srl',
    customerType: 'azienda' as const,
    vatNumber: '98765432109', fiscalCode: 'BNCLRA85C41F205Y',
    sdiCode: 'KRRH6B9', phone: '02 9876543',
    address: 'Viale Certosa 45', postcode: '20155', city: 'Milano', province: 'MI',
  },
  {
    email: 'giuseppe.verdi@gmail.com',
    firstName: 'Giuseppe', lastName: 'Verdi',
    customerType: 'privato' as const,
    fiscalCode: 'VRDGPP75D12F205Z', phone: '333 1234567',
    address: 'Via Torino 88', postcode: '20123', city: 'Milano', province: 'MI',
  },
  {
    email: 'anna.colombo@colomboassociati.it',
    firstName: 'Anna', lastName: 'Colombo',
    companyName: 'Colombo & Associati',
    customerType: 'azienda' as const,
    vatNumber: '11223344556', fiscalCode: 'CLMNNA78B52F205W',
    sdiCode: 'W7YVJK9', pecEmail: 'pec@colomboassociati.it',
    phone: '02 5551234',
    address: 'Corso Buenos Aires 33', postcode: '20124', city: 'Milano', province: 'MI',
  },
  {
    email: 'francesco.ferrari@hotmail.it',
    firstName: 'Francesco', lastName: 'Ferrari',
    customerType: 'privato' as const,
    fiscalCode: 'FRRFNC90H15L219K', phone: '347 9876543',
    address: 'Via Roma 15', postcode: '10121', city: 'Torino', province: 'TO',
  },
  {
    email: 'info@designstudiomilano.it',
    firstName: 'Elena', lastName: 'Marchetti',
    companyName: 'Design Studio Milano',
    customerType: 'azienda' as const,
    vatNumber: '55667788990', fiscalCode: 'MRCLNE82M45F205V',
    sdiCode: 'M5UXCR1', phone: '02 3456789',
    address: 'Via Tortona 27', postcode: '20144', city: 'Milano', province: 'MI',
  },
  {
    email: 'paolo.esposito@libero.it',
    firstName: 'Paolo', lastName: 'Esposito',
    customerType: 'privato' as const,
    fiscalCode: 'SPSPLA88S22F839A', phone: '340 1122334',
    address: 'Via Toledo 120', postcode: '80134', city: 'Napoli', province: 'NA',
  },
  {
    email: 'segreteria@avvocatobruno.it',
    firstName: 'Marco', lastName: 'Bruno',
    companyName: 'Studio Avv. Bruno',
    customerType: 'azienda' as const,
    vatNumber: '33445566778', fiscalCode: 'BRNMRC76A15F205U',
    sdiCode: 'KRRH6B9', pecEmail: 'pec@avvocatobruno.it',
    phone: '02 7788990',
    address: 'Piazza Duomo 5', postcode: '20122', city: 'Milano', province: 'MI',
  },
];

// Products to use in orders (real codes from catalog)
const productPool = [
  { code: 'HPC4931A', name: 'CARTUCCIA HP N.81 CIANO', price: 221.25, vat: 22 },
  { code: 'HPC4933A', name: 'CARTUCCIA HP N.81 GIALLO', price: 221.25, vat: 22 },
  { code: 'LVF-001', name: 'Lavazza Firma Qualità Rossa', price: 5.73, vat: 10 },
  { code: 'LVF-003', name: 'Lavazza Firma Crema e Gusto', price: 4.93, vat: 10 },
  { code: 'LVF-022', name: 'Bicchieri ECO Caffè 80cc', price: 2.30, vat: 22 },
  { code: 'LVF-028', name: 'Bicchieri Plastica Caffè 80cc', price: 1.76, vat: 22 },
  { code: '53525', name: 'Buste SPECIAL EVENTS argento', price: 2.39, vat: 22 },
  { code: '25189', name: 'Portaetichette adesive IES A1', price: 2.34, vat: 22 },
  { code: '53257', name: 'Buste forate per 2 CD/DVD', price: 2.68, vat: 22 },
  { code: '70731', name: 'Safety Shield fermafogli', price: 3.12, vat: 22 },
];

export async function POST() {
  try {
    const hash = await bcrypt.hash('Demo2026!', 12);
    const customerIds: number[] = [];

    // Insert customers
    for (const c of demoCustomers) {
      const [existing] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.email, c.email))
        .limit(1);

      if (existing) {
        customerIds.push(existing.id);
      } else {
        const [ins] = await db
          .insert(customers)
          .values({ ...c, passwordHash: hash, role: 'customer' })
          .returning({ id: customers.id });
        customerIds.push(ins.id);
      }
    }

    // Generate orders
    const statuses = ['nuovo', 'confermato', 'in_preparazione', 'spedito', 'consegnato', 'consegnato', 'annullato'];
    const paymentStatuses = ['pending', 'paid', 'paid', 'paid', 'paid', 'paid', 'failed'];
    const payments = ['paypal', 'bonifico', 'teamsystem'];
    let orderCount = 0;

    for (let i = 0; i < 18; i++) {
      const custIdx = i % customerIds.length;
      const custData = demoCustomers[custIdx];
      const custId = customerIds[custIdx];
      const statusIdx = i % statuses.length;

      // Random 2-4 items per order
      const numItems = 2 + (i % 3);
      const items: { code: string; name: string; price: number; vat: number; qty: number }[] = [];
      for (let j = 0; j < numItems; j++) {
        const prod = productPool[(i + j) % productPool.length];
        items.push({ ...prod, qty: 1 + (j % 3) });
      }

      const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
      const vatAmount = items.reduce((sum, it) => sum + (it.price * it.qty * it.vat) / 100, 0);
      const shippingCost = subtotal >= 100 ? 0 : 8.90;
      const total = subtotal + vatAmount + shippingCost;

      // Create date spread over last 2 months
      const daysAgo = Math.floor((18 - i) * 3.5);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      const orderNum = `MOS-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(1000 + i).slice(1)}`;

      // Check if order already exists
      const [existingOrder] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.orderNumber, orderNum))
        .limit(1);

      if (existingOrder) continue;

      const [order] = await db.insert(orders).values({
        orderNumber: orderNum,
        customerId: custId,
        customerName: custData.companyName || `${custData.firstName} ${custData.lastName}`,
        customerEmail: custData.email,
        customerVat: custData.vatNumber || null,
        customerFiscal: custData.fiscalCode || null,
        shippingAddress: custData.address,
        shippingPostcode: custData.postcode,
        shippingCity: custData.city,
        shippingProvince: custData.province,
        subtotal: subtotal.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: payments[i % payments.length],
        paymentStatus: paymentStatuses[statusIdx],
        status: statuses[statusIdx],
        notes: i % 4 === 0 ? 'Consegna al piano, citofono 3B' : undefined,
        createdAt: orderDate,
        updatedAt: orderDate,
      }).returning({ id: orders.id });

      // Insert order items
      for (const item of items) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productCode: item.code,
          productName: item.name,
          qty: item.qty,
          priceUnit: item.price.toFixed(2),
          vatPct: item.vat.toFixed(2),
          lineTotal: (item.price * item.qty).toFixed(2),
        });
      }

      orderCount++;
    }

    return NextResponse.json({
      success: true,
      customers: customerIds.length,
      orders: orderCount,
      message: `Creati ${customerIds.length} clienti e ${orderCount} ordini demo`,
    });
  } catch (err) {
    console.error('Seed demo error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
