import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, passwordResets } from '@/db/schema';
import { eq, and, isNull, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token e password obbligatori' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La password deve avere almeno 6 caratteri' }, { status: 400 });
    }

    // Find valid, unused token
    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.token, token),
          isNull(passwordResets.usedAt),
          gt(passwordResets.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetRecord) {
      return NextResponse.json({
        error: 'Link non valido o scaduto. Richiedi un nuovo link di recupero.',
      }, { status: 400 });
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 12);

    // Update customer password
    await db
      .update(customers)
      .set({ passwordHash: hash, updatedAt: new Date() })
      .where(eq(customers.id, resetRecord.customerId));

    // Mark token as used
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, resetRecord.id));

    console.log(`✅ Password reset successful for customer ID ${resetRecord.customerId}`);

    return NextResponse.json({
      success: true,
      message: 'Password reimpostata con successo. Puoi ora accedere con la nuova password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
