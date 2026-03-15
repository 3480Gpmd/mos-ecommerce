import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || 'MOS <noreply@milanooffreservizi.it>';

const ADMIN_EMAIL = process.env.ADMIN_EMAILS || 'info@milanooffreservizi.it';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY non configurata. Email non inviata.');
    console.log(`📧 [DEV] To: ${to} | Subject: ${subject}`);
    return { success: false, reason: 'no_api_key' };
  }

  try {
    const emailData: Parameters<typeof resend.emails.send>[0] = {
      from: FROM,
      to,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('🔴 Errore invio email:', error);
      return { success: false, reason: error.message };
    }

    console.log(`📧 Email inviata a ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('🔴 Errore Resend:', err);
    return { success: false, reason: 'send_failed' };
  }
}

export function getAdminEmail() {
  return ADMIN_EMAIL;
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: 'Reimposta la tua password - Milano Offre Servizi',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1d4ed8;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Milano Offre Servizi</h1>
  </div>

  <div style="padding: 30px 0;">
    <h2 style="color: #0f1923;">Recupero password</h2>
    <p>Hai richiesto il reset della tua password. Clicca il pulsante qui sotto per impostarne una nuova:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background-color: #1d4ed8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Reimposta password
      </a>
    </div>

    <p style="font-size: 13px; color: #666;">
      Se non hai richiesto tu il reset, puoi ignorare questa email. Il link scadrà tra 1 ora.
    </p>
    <p style="font-size: 12px; color: #999; word-break: break-all;">
      Link diretto: ${resetUrl}
    </p>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Milano Offre Servizi S.r.l.<br>Questa è un'email automatica, non rispondere.</p>
  </div>
</body>
</html>`,
  };
}

export function abandonedCartCustomerEmail(customerName: string, items: { name: string; qty: number; priceNet: string }[]) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mos-ecommerce.vercel.app';
  const itemsHtml = items.map((i) =>
    `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${i.name}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${i.qty}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">&euro; ${parseFloat(i.priceNet).toFixed(2)}</td></tr>`
  ).join('');

  return {
    subject: 'Hai dimenticato qualcosa nel carrello! - Milano Offre Servizi',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1d4ed8;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Milano Offre Servizi</h1>
  </div>

  <div style="padding: 30px 0;">
    <h2 style="color: #0f1923;">Ciao ${customerName},</h2>
    <p>Abbiamo notato che hai lasciato dei prodotti nel carrello. Ecco un riepilogo:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #666;">Prodotto</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #666;">Qtà</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">Prezzo</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/carrello"
         style="background-color: #1d4ed8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Completa il tuo ordine
      </a>
    </div>

    <p style="font-size: 13px; color: #666;">
      I prodotti nel carrello potrebbero non essere disponibili a lungo. Completa l'ordine per assicurarti la consegna.
    </p>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Milano Offre Servizi S.r.l.<br>Questa è un'email automatica, non rispondere.</p>
  </div>
</body>
</html>`,
  };
}

export function abandonedCartAdminEmail(customerName: string, customerEmail: string, items: { name: string; qty: number; priceNet: string }[]) {
  const itemsList = items.map((i) => `- ${i.name} (x${i.qty}) - € ${parseFloat(i.priceNet).toFixed(2)}`).join('<br>');
  const totalEstimate = items.reduce((sum, i) => sum + parseFloat(i.priceNet) * i.qty, 0);

  return {
    subject: `Carrello abbandonato: ${customerName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #dc2626;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Notifica Carrello Abbandonato</h1>
  </div>

  <div style="padding: 30px 0;">
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; color: #991b1b;">Il cliente ${customerName} ha abbandonato il carrello</p>
      <p style="margin: 8px 0 0; color: #666;">Email: ${customerEmail}</p>
    </div>

    <h3 style="color: #0f1923;">Prodotti nel carrello:</h3>
    <p style="line-height: 1.8;">${itemsList}</p>

    <p style="font-weight: bold; color: #0f1923; font-size: 16px;">
      Valore stimato: &euro; ${totalEstimate.toFixed(2)} + IVA
    </p>

    <p style="font-size: 13px; color: #666; margin-top: 20px;">
      Al cliente è stata inviata un'email di promemoria. Potrebbe essere opportuno contattarlo direttamente.
    </p>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Notifica automatica dal sistema MOS E-commerce</p>
  </div>
</body>
</html>`,
  };
}

export function welcomeEmail(name: string) {
  return {
    subject: 'Benvenuto su Milano Offre Servizi!',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1d4ed8;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Milano Offre Servizi</h1>
  </div>

  <div style="padding: 30px 0;">
    <h2 style="color: #0f1923;">Benvenuto${name ? ', ' + name : ''}!</h2>
    <p>Il tuo account è stato creato con successo su Milano Offre Servizi.</p>
    <p>Ora puoi accedere al nostro catalogo e ordinare prodotti per il tuo ufficio.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mos-ecommerce.vercel.app'}/catalogo"
         style="background-color: #1d4ed8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Vai al catalogo
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Milano Offre Servizi S.r.l.<br>Questa è un'email automatica, non rispondere.</p>
  </div>
</body>
</html>`,
  };
}

// Email notifica admin per nuova registrazione
export function newRegistrationAdminEmail(data: { email: string; firstName?: string; lastName?: string; companyName?: string; customerType: string; phone?: string }) {
  const name = data.companyName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;
  return {
    subject: `Nuova registrazione: ${name}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #16a34a;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Nuovo Cliente Registrato</h1>
  </div>
  <div style="padding: 30px 0;">
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; color: #166534;">Nuovo utente registrato sul sito</p>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666; width: 120px;">Tipo:</td><td style="padding: 8px 0; font-weight: bold;">${data.customerType === 'azienda' ? 'Azienda' : 'Privato'}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Nome:</td><td style="padding: 8px 0;">${data.firstName || '-'} ${data.lastName || ''}</td></tr>
      ${data.companyName ? `<tr><td style="padding: 8px 0; color: #666;">Azienda:</td><td style="padding: 8px 0;">${data.companyName}</td></tr>` : ''}
      <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
      ${data.phone ? `<tr><td style="padding: 8px 0; color: #666;">Telefono:</td><td style="padding: 8px 0;">${data.phone}</td></tr>` : ''}
    </table>
    ${data.customerType === 'azienda' ? '<p style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e;">⚠️ Account aziendale: richiede attivazione manuale dall\'admin.</p>' : ''}
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Notifica automatica dal sistema MOS E-commerce</p>
  </div>
</body>
</html>`,
  };
}

// Email notifica admin per richiesta preventivo
export function quoteRequestAdminEmail(data: { contactName: string; companyName?: string | null; email: string; phone?: string | null; message?: string | null; interests?: string | null }) {
  return {
    subject: `Nuova richiesta preventivo: ${data.contactName}${data.companyName ? ' - ' + data.companyName : ''}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f59e0b;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Nuova Richiesta Preventivo</h1>
  </div>
  <div style="padding: 30px 0;">
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; color: #92400e;">Un potenziale cliente ha richiesto un preventivo</p>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666; width: 120px;">Nome:</td><td style="padding: 8px 0; font-weight: bold;">${data.contactName}</td></tr>
      ${data.companyName ? `<tr><td style="padding: 8px 0; color: #666;">Azienda:</td><td style="padding: 8px 0;">${data.companyName}</td></tr>` : ''}
      <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
      ${data.phone ? `<tr><td style="padding: 8px 0; color: #666;">Telefono:</td><td style="padding: 8px 0;">${data.phone}</td></tr>` : ''}
      ${data.interests ? `<tr><td style="padding: 8px 0; color: #666;">Interessi:</td><td style="padding: 8px 0;">${data.interests}</td></tr>` : ''}
    </table>
    ${data.message ? `<div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;"><p style="margin: 0 0 4px; font-size: 12px; color: #666; font-weight: bold;">MESSAGGIO:</p><p style="margin: 0; white-space: pre-wrap;">${data.message}</p></div>` : ''}
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Notifica automatica dal sistema MOS E-commerce</p>
  </div>
</body>
</html>`,
  };
}

// Email ringraziamento al cliente dopo acquisto
export function orderConfirmationCustomerEmail(data: {
  customerName: string;
  orderNumber: string;
  items: { name: string; qty: number; priceNet: string; unit: string }[];
  subtotal: string;
  vatAmount: string;
  shippingCost: string;
  total: string;
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mos-ecommerce.vercel.app';
  const paymentLabel = { paypal: 'PayPal', teamsystem: 'TeamSystem Pay', bonifico: 'Bonifico Bancario' }[data.paymentMethod] || data.paymentMethod;
  const itemsHtml = data.items.map((i) =>
    `<tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px;">${i.name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">${i.qty} ${i.unit}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px;">&euro; ${parseFloat(i.priceNet).toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px;">&euro; ${(parseFloat(i.priceNet) * i.qty).toFixed(2)}</td>
    </tr>`
  ).join('');

  return {
    subject: `Conferma ordine ${data.orderNumber} - Milano Offre Servizi`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1d4ed8;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Milano Offre Servizi</h1>
  </div>
  <div style="padding: 30px 0;">
    <h2 style="color: #0f1923;">Grazie per il tuo ordine, ${data.customerName}!</h2>
    <p>Il tuo ordine <strong>${data.orderNumber}</strong> è stato ricevuto e verrà elaborato al più presto.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #666;">Prodotto</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #666;">Qtà</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #666;">Prezzo</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #666;">Totale</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr><td style="padding: 4px 0; color: #666;">Subtotale:</td><td style="text-align: right;">&euro; ${parseFloat(data.subtotal).toFixed(2)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">IVA:</td><td style="text-align: right;">&euro; ${parseFloat(data.vatAmount).toFixed(2)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Spedizione:</td><td style="text-align: right;">${parseFloat(data.shippingCost) === 0 ? 'Gratuita' : '&euro; ' + parseFloat(data.shippingCost).toFixed(2)}</td></tr>
        <tr><td style="padding: 8px 0 0; font-weight: bold; font-size: 16px; color: #0f1923; border-top: 1px solid #ddd;">Totale:</td><td style="text-align: right; padding: 8px 0 0; font-weight: bold; font-size: 16px; color: #0f1923; border-top: 1px solid #ddd;">&euro; ${parseFloat(data.total).toFixed(2)}</td></tr>
      </table>
    </div>

    <div style="margin: 20px 0; padding: 12px; background: #eff6ff; border-radius: 8px; font-size: 13px;">
      <p style="margin: 0 0 4px;"><strong>Pagamento:</strong> ${paymentLabel}</p>
      <p style="margin: 0;"><strong>Consegna:</strong> ${data.shippingAddress}, ${data.shippingCity}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/ordini"
         style="background-color: #1d4ed8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Visualizza i tuoi ordini
      </a>
    </div>
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Milano Offre Servizi S.r.l.<br>Questa è un'email automatica, non rispondere.</p>
  </div>
</body>
</html>`,
  };
}

// Email notifica admin per nuovo ordine
export function newOrderAdminEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { code: string; name: string; qty: number; priceNet: string; unit: string; vatPct: string }[];
  subtotal: string;
  vatAmount: string;
  shippingCost: string;
  total: string;
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  notes?: string | null;
  isUrgent?: boolean;
}) {
  const paymentLabel = { paypal: 'PayPal', teamsystem: 'TeamSystem Pay', bonifico: 'Bonifico Bancario' }[data.paymentMethod] || data.paymentMethod;
  const itemsHtml = data.items.map((i) =>
    `<tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 12px;">${i.code}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 12px;">${i.name}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 12px;">${i.qty}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px;">&euro; ${parseFloat(i.priceNet).toFixed(2)}</td>
    </tr>`
  ).join('');

  return {
    subject: `${data.isUrgent ? '🔴 URGENTE - ' : ''}Nuovo ordine ${data.orderNumber} - ${data.customerName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid ${data.isUrgent ? '#dc2626' : '#1d4ed8'};">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">${data.isUrgent ? '🔴 ORDINE URGENTE' : 'Nuovo Ordine Ricevuto'}</h1>
  </div>
  <div style="padding: 30px 0;">
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; color: #1e40af;">Ordine ${data.orderNumber}</p>
      <p style="margin: 4px 0 0; color: #666;">Cliente: ${data.customerName} (${data.customerEmail})</p>
      <p style="margin: 4px 0 0; color: #666;">Pagamento: ${paymentLabel}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="padding: 8px; text-align: left; font-size: 11px; color: #666;">Cod.</th>
          <th style="padding: 8px; text-align: left; font-size: 11px; color: #666;">Prodotto</th>
          <th style="padding: 8px; text-align: center; font-size: 11px; color: #666;">Qtà</th>
          <th style="padding: 8px; text-align: right; font-size: 11px; color: #666;">Prezzo</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="text-align: right; margin: 16px 0; font-size: 14px;">
      <p style="margin: 2px 0;">Subtotale: &euro; ${parseFloat(data.subtotal).toFixed(2)}</p>
      <p style="margin: 2px 0;">IVA: &euro; ${parseFloat(data.vatAmount).toFixed(2)}</p>
      <p style="margin: 2px 0;">Spedizione: ${parseFloat(data.shippingCost) === 0 ? 'Gratuita' : '&euro; ' + parseFloat(data.shippingCost).toFixed(2)}</p>
      <p style="margin: 8px 0 0; font-weight: bold; font-size: 18px; color: #0f1923;">Totale: &euro; ${parseFloat(data.total).toFixed(2)}</p>
    </div>

    <div style="padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; margin-top: 16px;">
      <p style="margin: 0;"><strong>Consegna:</strong> ${data.shippingAddress}, ${data.shippingCity}</p>
      ${data.notes ? `<p style="margin: 8px 0 0;"><strong>Note:</strong> ${data.notes}</p>` : ''}
    </div>

    <p style="margin-top: 20px; font-size: 13px; color: #666;">In allegato trovi il file Excel importabile in Danea Easyfatt.</p>
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Notifica automatica dal sistema MOS E-commerce</p>
  </div>
</body>
</html>`,
  };
}
