import { escapeXml } from './utils';
import type { Order, OrderItem, Customer } from '@/db/schema';

interface EasyfattOrder {
  order: Order;
  items: OrderItem[];
  customer: Customer;
}

function paymentMethodName(method: string | null): string {
  switch (method) {
    case 'paypal': return 'PayPal';
    case 'teamsystem': return 'TeamSystem Pay';
    case 'bonifico': return 'Bonifico Bancario';
    default: return 'Altro';
  }
}

function buildDocumentXml(data: EasyfattOrder): string {
  const { order, items, customer } = data;
  const orderDate = order.createdAt instanceof Date
    ? order.createdAt.toISOString().split('T')[0]
    : new Date(order.createdAt).toISOString().split('T')[0];

  const rowsXml = items.map((item) => `
      <Row>
        <Code>${escapeXml(item.productCode)}</Code>
        <Description>${escapeXml(item.productName)}</Description>
        <Qty>${item.qty}</Qty>
        <Um>${escapeXml(item.unit || 'PZ')}</Um>
        <Price>${item.priceUnit}</Price>
        ${parseFloat(String(item.discountPct || '0')) > 0 ? `<Discounts>${item.discountPct}</Discounts>` : ''}
        <VatCode Perc="${item.vatPct}" Class="Imponibile">${item.vatPct}</VatCode>
        <Total>${item.lineTotal}</Total>
      </Row>`).join('');

  return `
    <Document>
      <DocumentType>C</DocumentType>
      <Date>${orderDate}</Date>
      <Number>${escapeXml(order.orderNumber)}</Number>
      <Numbering></Numbering>
      <CostDescription></CostDescription>
      <TotalWithoutTax>${order.subtotal}</TotalWithoutTax>
      <VatAmount>${order.vatAmount}</VatAmount>
      <Total>${order.total}</Total>
      <PriceList>Dom. Consegna</PriceList>
      <PricesIncludeVat>false</PricesIncludeVat>
      <CustomerCode>${escapeXml(customer.easyfattCode || '')}</CustomerCode>
      <CustomerWebLogin>${escapeXml(customer.email)}</CustomerWebLogin>
      <CustomerName>${escapeXml(customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim())}</CustomerName>
      <CustomerAddress>${escapeXml(customer.address || '')}</CustomerAddress>
      <CustomerPostcode>${escapeXml(customer.postcode || '')}</CustomerPostcode>
      <CustomerCity>${escapeXml(customer.city || '')}</CustomerCity>
      <CustomerProvince>${escapeXml(customer.province || '')}</CustomerProvince>
      <CustomerCountry>Italia</CustomerCountry>
      <CustomerFiscalCode>${escapeXml(customer.fiscalCode || '')}</CustomerFiscalCode>
      <CustomerVatCode>${escapeXml(customer.vatNumber || '')}</CustomerVatCode>
      <CustomerTel>${escapeXml(customer.phone || '')}</CustomerTel>
      <CustomerEmail>${escapeXml(customer.email)}</CustomerEmail>
      ${customer.pecEmail ? `<CustomerPec>${escapeXml(customer.pecEmail)}</CustomerPec>` : ''}
      ${customer.sdiCode ? `<CustomerSdi>${escapeXml(customer.sdiCode)}</CustomerSdi>` : ''}
      <DeliveryName>${escapeXml(order.customerName || '')}</DeliveryName>
      <DeliveryAddress>${escapeXml(order.shippingAddress || '')}</DeliveryAddress>
      <DeliveryPostcode>${escapeXml(order.shippingPostcode || '')}</DeliveryPostcode>
      <DeliveryCity>${escapeXml(order.shippingCity || '')}</DeliveryCity>
      <DeliveryProvince>${escapeXml(order.shippingProvince || '')}</DeliveryProvince>
      <PaymentName>${paymentMethodName(order.paymentMethod)}</PaymentName>
      <Rows>${rowsXml}
      </Rows>
    </Document>`;
}

export function generateEasyfattXml(ordersData: EasyfattOrder[]): string {
  const documentsXml = ordersData.map(buildDocumentXml).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<EasyfattDocuments AppVersion="2" Creator="MOS E-Commerce">
  <Company>
    <Name>Milano Offre Servizi</Name>
  </Company>
  <Documents>${documentsXml}
  </Documents>
</EasyfattDocuments>`;
}
