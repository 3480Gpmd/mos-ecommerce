import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST() {
  try {
    const session = await auth();
    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    // Add isActive column to customers
    await db.execute(sql`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false
    `);

    // Set existing customers as active (they were already active before this feature)
    await db.execute(sql`
      UPDATE customers SET is_active = true WHERE is_active = false
    `);

    // Create password_resets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token)
    `);

    // Create site_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        label VARCHAR(255) NOT NULL,
        "group" VARCHAR(50) NOT NULL DEFAULT 'general',
        type VARCHAR(20) NOT NULL DEFAULT 'text',
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Seed default settings
    const defaultSettings = [
      { key: 'site_name', value: 'MOS E-commerce', label: 'Nome sito', group: 'general', type: 'text' },
      { key: 'site_email', value: 'info@milanooffreservizi.it', label: 'Email contatto', group: 'general', type: 'email' },
      { key: 'site_phone', value: '+39 02 8088 8356', label: 'Telefono', group: 'general', type: 'text' },
      { key: 'site_address', value: 'Via Vincenzo Monti 8, 20123 Milano (MI)', label: 'Indirizzo', group: 'general', type: 'text' },
      { key: 'site_vat', value: '10251850965', label: 'P.IVA', group: 'general', type: 'text' },
      { key: 'min_order_amount', value: '0', label: 'Importo minimo ordine (EUR)', group: 'orders', type: 'number' },
      { key: 'free_shipping_threshold', value: '100', label: 'Soglia spedizione gratuita (EUR)', group: 'orders', type: 'number' },
      { key: 'shipping_cost', value: '8.90', label: 'Costo spedizione standard (EUR)', group: 'orders', type: 'number' },
      { key: 'homepage_hero_title', value: 'Il tuo ufficio, tutto in un click', label: 'Titolo hero homepage', group: 'content', type: 'text' },
      { key: 'homepage_hero_subtitle', value: 'Forniture per ufficio, cancelleria, tecnologia e caffè con consegna rapida a Milano e in tutta Italia', label: 'Sottotitolo hero', group: 'content', type: 'textarea' },
      { key: 'footer_text', value: '© 2026 Milano Offre Servizi. Tutti i diritti riservati.', label: 'Testo footer', group: 'content', type: 'text' },
      { key: 'smtp_host', value: '', label: 'SMTP Host', group: 'email', type: 'text' },
      { key: 'smtp_port', value: '587', label: 'SMTP Porta', group: 'email', type: 'number' },
      { key: 'smtp_user', value: '', label: 'SMTP Utente', group: 'email', type: 'text' },
      { key: 'smtp_from', value: 'noreply@milanooffreservizi.it', label: 'Email mittente', group: 'email', type: 'email' },
    ];

    for (const s of defaultSettings) {
      await db.execute(sql`
        INSERT INTO site_settings (key, value, label, "group", type)
        VALUES (${s.key}, ${s.value}, ${s.label}, ${s.group}, ${s.type})
        ON CONFLICT (key) DO NOTHING
      `);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration v2 completata: password_resets, site_settings, isActive customers',
    });
  } catch (err) {
    console.error('Migration v2 error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
