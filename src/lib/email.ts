import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || 'MOS <noreply@milanooffreservizi.it>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY non configurata. Email non inviata.');
    console.log(`📧 [DEV] To: ${to} | Subject: ${subject}`);
    return { success: false, reason: 'no_api_key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

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
