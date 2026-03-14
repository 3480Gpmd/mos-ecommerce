import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Temporary migration endpoint - DELETE after use
export async function POST() {
  try {
    // Add role column to customers
    await db.execute(sql`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer'
    `);

    // Set admin role for dave
    await db.execute(sql`
      UPDATE customers SET role = 'admin' WHERE LOWER(email) = 'dave@milanooffreservizi.it'
    `);

    return NextResponse.json({ success: true, message: 'Migration complete' });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Check admin status
export async function GET() {
  try {
    const [admin] = await db
      .select({
        id: customers.id,
        email: customers.email,
        role: customers.role,
        hasPassword: sql<boolean>`LENGTH(${customers.passwordHash}) > 0`,
      })
      .from(customers)
      .where(eq(customers.email, 'dave@milanooffreservizi.it'))
      .limit(1);

    if (!admin) {
      return NextResponse.json({ exists: false, message: 'Admin user not found in DB' });
    }

    return NextResponse.json({
      exists: true,
      email: admin.email,
      role: admin.role,
      hasPassword: admin.hasPassword,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Create/reset admin password
export async function PUT(req: Request) {
  try {
    const { password } = await req.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    // Check if admin exists
    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.email, 'dave@milanooffreservizi.it'))
      .limit(1);

    if (existing) {
      await db
        .update(customers)
        .set({ passwordHash: hash, role: 'admin' })
        .where(eq(customers.id, existing.id));
      return NextResponse.json({ success: true, action: 'updated' });
    } else {
      await db.insert(customers).values({
        email: 'dave@milanooffreservizi.it',
        passwordHash: hash,
        firstName: 'Davide',
        lastName: 'Mareggini',
        companyName: 'MOS MilanoOffreServizi',
        customerType: 'azienda',
        role: 'admin',
      });
      return NextResponse.json({ success: true, action: 'created' });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
