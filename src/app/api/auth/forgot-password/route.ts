import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, passwordResets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendEmail, passwordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email obbligatoria' }, { status: 400 });
    }

    // Find customer by email (case-insensitive)
    const [customer] = await db
      .select({ id: customers.id, email: customers.email })
      .from(customers)
      .where(eq(customers.email, email.toLowerCase().trim()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!customer) {
      return NextResponse.json({
        success: true,
        message: 'Se l\'email è registrata, riceverai un link per reimpostare la password.',
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    await db.insert(passwordResets).values({
      customerId: customer.id,
      token,
      expiresAt,
    });

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://mos-ecommerce.vercel.app';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    console.log(`🔑 Password reset requested for ${customer.email}`);

    // Send email with Resend
    const emailContent = passwordResetEmail(resetUrl);
    const result = await sendEmail({
      to: customer.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!result.success) {
      console.warn(`⚠️ Email non inviata: ${result.reason}. Reset URL: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Se l\'email è registrata, riceverai un link per reimpostare la password.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
