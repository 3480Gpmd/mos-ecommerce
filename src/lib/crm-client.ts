import type { Customer, Order, OrderItem } from '@/db/schema';

const CRM_BASE_URL = process.env.CRM_URL || 'http://localhost:3001';
const CRM_API_KEY = process.env.CRM_API_KEY;

async function crmFetch(path: string, options: RequestInit = {}) {
  const url = `${CRM_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': CRM_API_KEY || '',
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!res.ok) {
    throw new Error(`CRM API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function syncCustomerToCRM(customer: Customer): Promise<string> {
  const data = await crmFetch('/api/shop/clienti', {
    method: 'POST',
    body: JSON.stringify({
      email: customer.email,
      ragione_sociale: customer.companyName || `${customer.firstName} ${customer.lastName}`,
      partita_iva: customer.vatNumber,
      codice_fiscale: customer.fiscalCode,
      telefono: customer.phone,
      indirizzo: customer.address,
      cap: customer.postcode,
      citta: customer.city,
      provincia: customer.province,
      tipo: customer.customerType,
      pec: customer.pecEmail,
      sdi: customer.sdiCode,
    }),
  });

  return data.crm_id || data.id;
}

export async function syncOrderToCRM(order: Order, items: OrderItem[]): Promise<string> {
  const data = await crmFetch('/api/shop/ordini', {
    method: 'POST',
    body: JSON.stringify({
      numero_ordine: order.orderNumber,
      cliente_crm_id: order.customerId,
      data_ordine: order.createdAt,
      stato: order.status,
      totale: order.total,
      subtotale: order.subtotal,
      iva: order.vatAmount,
      spedizione: order.shippingCost,
      metodo_pagamento: order.paymentMethod,
      stato_pagamento: order.paymentStatus,
      righe: items.map((item) => ({
        codice_prodotto: item.productCode,
        nome_prodotto: item.productName,
        quantita: item.qty,
        prezzo_unitario: item.priceUnit,
        iva_pct: item.vatPct,
        totale_riga: item.lineTotal,
      })),
    }),
  });

  return data.crm_order_id || data.id;
}

export async function notifyOrderStatusToCRM(crmOrderId: string, status: string): Promise<void> {
  await crmFetch(`/api/shop/ordini/${crmOrderId}/stato`, {
    method: 'PATCH',
    body: JSON.stringify({ stato: status }),
  });
}

export async function findCustomerInCRM(email: string): Promise<{ crm_id: string } | null> {
  try {
    const data = await crmFetch(`/api/shop/clienti/${encodeURIComponent(email)}`);
    return data;
  } catch {
    return null;
  }
}

export async function isCrmAvailable(): Promise<boolean> {
  try {
    await fetch(`${CRM_BASE_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return true;
  } catch {
    return false;
  }
}
