import { sendEmail } from './email';

const MOS_ADDRESS = 'Via Romolo Bitti 28, 20125 Milano';
const MOS_NAME = 'MOS MilanoOffreServizi di Davide Mareggini';

interface SupplierEmailItem {
  code: string;
  name: string;
  brand?: string;
  qty: number;
  unit: string;
  priceNet: string;
  vatPct: string;
}

interface SendSupplierOrderEmailParams {
  supplierId: number;
  supplierEmail: string;
  supplierName: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: SupplierEmailItem[];
  deliveryType: 'drop_ship' | 'sede_mos';
  deliveryAddress?: string;
  deliveryPostcode?: string;
  deliveryCity?: string;
  deliveryProvince?: string;
  notes?: string | null;
}

export function supplierOrderEmailTemplate(data: SendSupplierOrderEmailParams) {
  const isDropShip = data.deliveryType === 'drop_ship';
  const deliveryLabel = isDropShip ? 'DROP SHIPPING' : 'CONSEGNA SEDE MOS';

  let deliveryHtml = '';
  if (isDropShip) {
    deliveryHtml = `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin: 12px 0;">
        <p style="margin: 0 0 8px; font-weight: bold; color: #1e40af;">DROP SHIPPING - Consegna al cliente</p>
        <p style="margin: 4px 0; color: #1e40af;">
          <strong>${data.customerName}</strong><br>
          ${data.deliveryAddress}<br>
          ${data.deliveryPostcode} ${data.deliveryCity} (${data.deliveryProvince})
        </p>
      </div>`;
  } else {
    deliveryHtml = `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 12px 0;">
        <p style="margin: 0 0 8px; font-weight: bold; color: #166534;">CONSEGNA SEDE MOS</p>
        <p style="margin: 4px 0; color: #166534;">
          <strong>${MOS_NAME}</strong><br>
          ${MOS_ADDRESS}
        </p>
      </div>`;
  }

  const itemsHtml = data.items.map((item) =>
    `<tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 12px;">${item.code}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 12px;">
        ${item.brand ? `<strong>${item.brand}</strong><br>` : ''}${item.name}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 12px;">${item.qty} ${item.unit}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px;">&euro; ${parseFloat(item.priceNet).toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px;">${item.vatPct}%</td>
    </tr>`
  ).join('');

  return {
    subject: `Ordine Fornitore ${data.orderNumber} - ${data.customerName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1d4ed8;">
    <h1 style="color: #0f1923; margin: 0; font-size: 24px;">Milano Offre Servizi</h1>
    <p style="margin: 4px 0 0; color: #666; font-size: 13px;">Ordine per Fornitore</p>
  </div>

  <div style="padding: 30px 0;">
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold; color: #1e40af; font-size: 16px;">Ordine ${data.orderNumber}</p>
      <p style="margin: 4px 0 0; color: #666;">Cliente: ${data.customerName}</p>
      <p style="margin: 4px 0 0; color: #666;">Email: ${data.customerEmail}</p>
    </div>

    <h3 style="color: #0f1923; margin: 20px 0 12px;">Modalità Consegna</h3>
    ${deliveryHtml}

    <h3 style="color: #0f1923; margin: 20px 0 12px;">Articoli</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #666; border-bottom: 2px solid #cbd5e1;">Codice</th>
          <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #666; border-bottom: 2px solid #cbd5e1;">Descrizione</th>
          <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #666; border-bottom: 2px solid #cbd5e1;">Quantità</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #666; border-bottom: 2px solid #cbd5e1;">Prezzo</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #666; border-bottom: 2px solid #cbd5e1;">IVA</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    ${data.notes ? `
    <div style="margin: 20px 0; padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #666; font-weight: bold;">NOTE:</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 13px;">${data.notes}</p>
    </div>
    ` : ''}

    <div style="margin: 20px 0; padding: 12px; background: #fff8e6; border-radius: 8px; border: 1px solid #fcd34d; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #92400e;">
        <strong>Istruzioni:</strong> Prepara i prodotti indicati e procedi con la consegna secondo la modalità specificata sopra.
      </p>
    </div>

    <p style="margin-top: 20px; font-size: 13px; color: #666; line-height: 1.6;">
      Questo ordine è gestito da MOS Milano Offre Servizi. Per qualsiasi domanda contatta l'amministrazione.
    </p>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #999; text-align: center;">
    <p>Milano Offre Servizi S.r.l. - ${MOS_ADDRESS}<br>Questa è un'email automatica, non rispondere a questo indirizzo.</p>
  </div>
</body>
</html>`,
  };
}

export async function sendSupplierOrderEmail(params: SendSupplierOrderEmailParams) {
  try {
    const emailTemplate = supplierOrderEmailTemplate(params);
    const result = await sendEmail({
      to: params.supplierEmail,
      ...emailTemplate,
    });
    return result;
  } catch (error) {
    console.error('Error sending supplier order email:', error);
    return { success: false, reason: 'send_failed' };
  }
}
