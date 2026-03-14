export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function formatPrice(price: number | string, includeVat = false, vatRate = 22): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const finalPrice = includeVat ? numPrice * (1 + vatRate / 100) : numPrice;
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(finalPrice);
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${year}-${rand}`;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
