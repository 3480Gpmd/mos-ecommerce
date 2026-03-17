import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  decimal,
  timestamp,
  serial,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Gerarchia categorie ───────────────────────────────────────────

export const productGroups = pgTable('product_groups', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0),
  relevanceScore: integer('relevance_score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_groups_code_idx').on(table.code),
]);

export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  groupId: integer('group_id').references(() => productGroups.id).notNull(),
  sortOrder: integer('sort_order').default(0),
  relevanceScore: integer('relevance_score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_categories_code_idx').on(table.code),
  index('product_categories_group_idx').on(table.groupId),
]);

export const productSubcategories = pgTable('product_subcategories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  categoryId: integer('category_id').references(() => productCategories.id).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_subcategories_code_idx').on(table.code),
  index('product_subcategories_category_idx').on(table.categoryId),
]);

// ─── Prodotti ──────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: text('name').notNull(),
  brand: varchar('brand', { length: 255 }),
  partNumber: varchar('part_number', { length: 255 }),
  barcode: varchar('barcode', { length: 100 }),
  description: text('description'),
  unit: varchar('unit', { length: 20 }).default('PZ'),

  pricePublic: decimal('price_public', { precision: 10, scale: 2 }),
  priceNet: decimal('price_net', { precision: 10, scale: 2 }).notNull(),
  vatCode: decimal('vat_code', { precision: 5, scale: 2 }).notNull().default('22'),

  stockAvailable: integer('stock_available').default(0),
  stockOrdered: integer('stock_ordered').default(0),
  stockArrivalDate: varchar('stock_arrival_date', { length: 20 }),

  // Ordine minimo
  minOrderQty: integer('min_order_qty').default(1),
  orderMultiple: integer('order_multiple').default(1),
  packSize: integer('pack_size'),

  maxOrderQty: integer('max_order_qty'),

  isActive: boolean('is_active').default(true).notNull(),
  isManual: boolean('is_manual').default(false).notNull(),
  isPromo: boolean('is_promo').default(false).notNull(),
  isExhausting: boolean('is_exhausting').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isSuperPrice: boolean('is_super_price').default(false).notNull(),
  isZeroMarkup: boolean('is_zero_markup').default(false).notNull(),
  isNew: boolean('is_new').default(false).notNull(),

  superPrice: decimal('super_price', { precision: 10, scale: 2 }),
  featuredSort: integer('featured_sort').default(0),
  relevanceScore: integer('relevance_score').default(0),
  promoStartDate: timestamp('promo_start_date'),
  promoEndDate: timestamp('promo_end_date'),
  newUntilDate: timestamp('new_until_date'),

  imageUrl: text('image_url'),
  imageCustom: text('image_custom'),

  groupId: integer('group_id').references(() => productGroups.id),
  categoryId: integer('category_id').references(() => productCategories.id),
  subcategoryId: integer('subcategory_id').references(() => productSubcategories.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('products_code_idx').on(table.code),
  index('products_brand_idx').on(table.brand),
  index('products_group_idx').on(table.groupId),
  index('products_category_idx').on(table.categoryId),
  index('products_subcategory_idx').on(table.subcategoryId),
  index('products_active_idx').on(table.isActive),
  index('products_name_idx').on(table.name),
]);

// ─── Clienti ───────────────────────────────────────────────────────

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'), // nullable per utenti OAuth
  oauthProvider: varchar('oauth_provider', { length: 20 }), // 'google' | 'apple'
  oauthId: varchar('oauth_id', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  companyName: varchar('company_name', { length: 255 }),
  customerType: varchar('customer_type', { length: 20 }).notNull().default('privato'), // 'privato' | 'azienda'
  vatNumber: varchar('vat_number', { length: 20 }),
  fiscalCode: varchar('fiscal_code', { length: 20 }),
  sdiCode: varchar('sdi_code', { length: 10 }),
  pecEmail: varchar('pec_email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  birthDate: varchar('birth_date', { length: 10 }), // formato DD/MM/YYYY
  address: text('address'),
  postcode: varchar('postcode', { length: 10 }),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 5 }),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // 'customer' | 'admin'
  isActive: boolean('is_active').default(false).notNull(), // admin must activate
  priceList: varchar('price_list', { length: 50 }).default('standard'),
  easyfattCode: varchar('easyfatt_code', { length: 50 }),
  crmId: varchar('crm_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('customers_email_idx').on(table.email),
  index('customers_type_idx').on(table.customerType),
  index('customers_crm_idx').on(table.crmId),
]);

// ─── Ordini ────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),

  // Snapshot cliente
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerVat: varchar('customer_vat', { length: 20 }),
  customerFiscal: varchar('customer_fiscal', { length: 20 }),

  // Spedizione
  shippingAddress: text('shipping_address'),
  shippingPostcode: varchar('shipping_postcode', { length: 10 }),
  shippingCity: varchar('shipping_city', { length: 100 }),
  shippingProvince: varchar('shipping_province', { length: 5 }),

  // Importi
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal('vat_amount', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),

  // Pagamento
  paymentMethod: varchar('payment_method', { length: 30 }), // 'paypal' | 'teamsystem' | 'bonifico'
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(), // 'pending' | 'paid' | 'failed'
  paymentRef: varchar('payment_ref', { length: 255 }),

  // Stato
  status: varchar('status', { length: 30 }).default('nuovo').notNull(),
  // 'nuovo' | 'confermato' | 'in_preparazione' | 'spedito' | 'consegnato' | 'annullato'

  // Urgenza e destinazione alternativa
  isUrgent: boolean('is_urgent').default(false).notNull(),
  altShipping: boolean('alt_shipping').default(false).notNull(),
  altShippingAddress: text('alt_shipping_address'),
  altShippingPostcode: varchar('alt_shipping_postcode', { length: 10 }),
  altShippingCity: varchar('alt_shipping_city', { length: 100 }),
  altShippingProvince: varchar('alt_shipping_province', { length: 5 }),
  altShippingName: varchar('alt_shipping_name', { length: 255 }),

  // Note
  notes: text('notes'),
  adminNotes: text('admin_notes'),

  // Integrazioni
  easyfattExported: boolean('easyfatt_exported').default(false).notNull(),
  easyfattDate: timestamp('easyfatt_date'),
  crmOrderId: varchar('crm_order_id', { length: 100 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('orders_number_idx').on(table.orderNumber),
  index('orders_customer_idx').on(table.customerId),
  index('orders_status_idx').on(table.status),
  index('orders_payment_idx').on(table.paymentStatus),
  index('orders_created_idx').on(table.createdAt),
]);

// ─── Righe ordine ──────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id),
  productCode: varchar('product_code', { length: 100 }).notNull(),
  productName: text('product_name').notNull(),
  productBrand: varchar('product_brand', { length: 255 }),
  unit: varchar('unit', { length: 20 }).default('PZ'),
  qty: integer('qty').notNull(),
  priceUnit: decimal('price_unit', { precision: 10, scale: 2 }).notNull(),
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }).default('0'),
  vatPct: decimal('vat_pct', { precision: 5, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull(),
  isUrgent: boolean('is_urgent').default(false).notNull(),
}, (table) => [
  index('order_items_order_idx').on(table.orderId),
  index('order_items_product_idx').on(table.productId),
]);

// ─── Wishlist ──────────────────────────────────────────────────────

export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('wishlists_unique_idx').on(table.customerId, table.productId),
]);

// ─── Cart (persistente) ────────────────────────────────────────────

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  qty: integer('qty').notNull().default(1),
  isUrgent: boolean('is_urgent').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('cart_items_unique_idx').on(table.customerId, table.productId),
]);

// ─── Log import CSV ────────────────────────────────────────────────

export const csvImports = pgTable('csv_imports', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  importedAt: timestamp('imported_at').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('running'), // 'running' | 'completed' | 'failed'
  totalRows: integer('total_rows').default(0),
  productsNew: integer('products_new').default(0),
  productsUpdated: integer('products_updated').default(0),
  productsDeactivated: integer('products_deactivated').default(0),
  errors: integer('errors').default(0),
  errorLog: text('error_log'),
  durationMs: integer('duration_ms'),
});

// ─── CRM sync queue ───────────────────────────────────────────────

export const crmSyncQueue = pgTable('crm_sync_queue', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type', { length: 30 }).notNull(), // 'customer' | 'order' | 'order_status'
  entityId: integer('entity_id').notNull(),
  action: varchar('action', { length: 30 }).notNull(), // 'sync_customer' | 'sync_order' | 'update_status'
  payload: text('payload'), // JSON string
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'processing' | 'completed' | 'failed'
  attempts: integer('attempts').default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
}, (table) => [
  index('crm_sync_queue_status_idx').on(table.status),
  index('crm_sync_queue_entity_idx').on(table.entityType, table.entityId),
]);

// ─── Listini prezzi ───────────────────────────────────────────────

export const priceLists = pgTable('price_lists', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // 'standard', 'rivenditori', 'vip'
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }).default('0'), // sconto globale %
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('price_lists_code_idx').on(table.code),
]);

// ─── Ricarichi per categoria (markup) ─────────────────────────────

export const categoryMarkups = pgTable('category_markups', {
  id: serial('id').primaryKey(),
  priceListId: integer('price_list_id').references(() => priceLists.id, { onDelete: 'cascade' }).notNull(),
  groupId: integer('group_id').references(() => productGroups.id),
  categoryId: integer('category_id').references(() => productCategories.id),
  subcategoryId: integer('subcategory_id').references(() => productSubcategories.id),
  markupPct: decimal('markup_pct', { precision: 5, scale: 2 }).notNull().default('0'), // ricarico %
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }).default('0'), // sconto %
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('category_markups_list_idx').on(table.priceListId),
  index('category_markups_group_idx').on(table.groupId),
  index('category_markups_category_idx').on(table.categoryId),
]);

// ─── Sconti speciali per prodotto/cliente ─────────────────────────

export const specialDiscounts = pgTable('special_discounts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // 'product' | 'category' | 'customer' | 'global'
  // Riferimenti opzionali
  productId: integer('product_id').references(() => products.id),
  groupId: integer('group_id').references(() => productGroups.id),
  categoryId: integer('category_id').references(() => productCategories.id),
  customerId: integer('customer_id').references(() => customers.id),
  priceListId: integer('price_list_id').references(() => priceLists.id),
  // Valori
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }).default('0'),
  fixedPrice: decimal('fixed_price', { precision: 10, scale: 2 }),
  // Validità
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('special_discounts_type_idx').on(table.type),
  index('special_discounts_product_idx').on(table.productId),
  index('special_discounts_customer_idx').on(table.customerId),
  index('special_discounts_active_idx').on(table.isActive),
]);

// ─── Relations ─────────────────────────────────────────────────────

export const productGroupsRelations = relations(productGroups, ({ many }) => ({
  categories: many(productCategories),
  products: many(products),
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  group: one(productGroups, { fields: [productCategories.groupId], references: [productGroups.id] }),
  subcategories: many(productSubcategories),
  products: many(products),
}));

export const productSubcategoriesRelations = relations(productSubcategories, ({ one, many }) => ({
  category: one(productCategories, { fields: [productSubcategories.categoryId], references: [productCategories.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  group: one(productGroups, { fields: [products.groupId], references: [productGroups.id] }),
  category: one(productCategories, { fields: [products.categoryId], references: [productCategories.id] }),
  subcategory: one(productSubcategories, { fields: [products.subcategoryId], references: [productSubcategories.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  wishlists: many(wishlists),
  cartItems: many(cartItems),
  notes: many(customerNotes),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  customer: one(customers, { fields: [wishlists.customerId], references: [customers.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  customer: one(customers, { fields: [cartItems.customerId], references: [customers.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const priceListsRelations = relations(priceLists, ({ many }) => ({
  markups: many(categoryMarkups),
  discounts: many(specialDiscounts),
}));

export const categoryMarkupsRelations = relations(categoryMarkups, ({ one }) => ({
  priceList: one(priceLists, { fields: [categoryMarkups.priceListId], references: [priceLists.id] }),
  group: one(productGroups, { fields: [categoryMarkups.groupId], references: [productGroups.id] }),
  category: one(productCategories, { fields: [categoryMarkups.categoryId], references: [productCategories.id] }),
  subcategory: one(productSubcategories, { fields: [categoryMarkups.subcategoryId], references: [productSubcategories.id] }),
}));

export const specialDiscountsRelations = relations(specialDiscounts, ({ one }) => ({
  product: one(products, { fields: [specialDiscounts.productId], references: [products.id] }),
  group: one(productGroups, { fields: [specialDiscounts.groupId], references: [productGroups.id] }),
  category: one(productCategories, { fields: [specialDiscounts.categoryId], references: [productCategories.id] }),
  customer: one(customers, { fields: [specialDiscounts.customerId], references: [customers.id] }),
  priceList: one(priceLists, { fields: [specialDiscounts.priceListId], references: [priceLists.id] }),
}));

// ─── Password reset tokens ────────────────────────────────────────

export const passwordResets = pgTable('password_resets', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('password_resets_token_idx').on(table.token),
  index('password_resets_customer_idx').on(table.customerId),
]);

// ─── Impostazioni sito (editabili da admin) ───────────────────────

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  group: varchar('group', { length: 50 }).notNull().default('general'),
  type: varchar('type', { length: 20 }).notNull().default('text'), // 'text' | 'textarea' | 'number' | 'boolean' | 'email'
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('site_settings_key_idx').on(table.key),
  index('site_settings_group_idx').on(table.group),
]);

// ─── Note e attività cliente (CRM leggero) ──────────────────────

export const customerNotes = pgTable('customer_notes', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('nota'), // 'nota' | 'chiamata' | 'visita' | 'email' | 'promemoria'
  reminderDate: timestamp('reminder_date'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('customer_notes_customer_idx').on(table.customerId),
  index('customer_notes_type_idx').on(table.type),
  index('customer_notes_reminder_idx').on(table.reminderDate),
]);

// ─── Richieste preventivo ────────────────────────────────────────

export const quoteRequests = pgTable('quote_requests', {
  id: serial('id').primaryKey(),
  companyName: varchar('company_name', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  message: text('message'),
  interests: text('interests'), // 'caffè, acqua, forniture'
  status: varchar('status', { length: 30 }).notNull().default('nuovo'), // 'nuovo' | 'contattato' | 'preventivo_inviato' | 'chiuso'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('quote_requests_status_idx').on(table.status),
  index('quote_requests_created_idx').on(table.createdAt),
]);

// ─── Relations CRM ────────────────────────────────────────────────

export const customerNotesRelations = relations(customerNotes, ({ one }) => ({
  customer: one(customers, { fields: [customerNotes.customerId], references: [customers.id] }),
}));

// ─── Abandoned cart tracking ──────────────────────────────────────

export const cartAbandonmentEmails = pgTable('cart_abandonment_emails', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  emailType: varchar('email_type', { length: 30 }).notNull(), // 'customer_reminder' | 'admin_notification'
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (table) => [
  index('cart_abandonment_customer_idx').on(table.customerId),
  index('cart_abandonment_type_idx').on(table.emailType),
]);

// ─── Modalità di pagamento ────────────────────────────────────────

export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Regole spedizione ───────────────────────────────────────────

export const shippingRules = pgTable('shipping_rules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  minAmount: decimal('min_amount', { precision: 10, scale: 2 }).default('0'),
  maxAmount: decimal('max_amount', { precision: 10, scale: 2 }),
  minWeight: decimal('min_weight', { precision: 10, scale: 2 }),
  maxWeight: decimal('max_weight', { precision: 10, scale: 2 }),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Supplementi ingombranti ─────────────────────────────────────

export const bulkySurcharges = pgTable('bulky_surcharges', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  categoryId: integer('category_id').references(() => productCategories.id),
  productId: integer('product_id').references(() => products.id),
  minQty: integer('min_qty').default(1),
  surcharge: decimal('surcharge', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Zone di spedizione ──────────────────────────────────────────

export const shippingZones = pgTable('shipping_zones', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  provinces: text('provinces').notNull(), // comma-separated province codes
  extraCost: decimal('extra_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Coupon ──────────────────────────────────────────────────────

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage' | 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('coupons_code_idx').on(table.code),
]);

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id').references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  orderId: integer('order_id').references(() => orders.id),
  customerId: integer('customer_id').references(() => customers.id),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
}, (table) => [
  index('coupon_redemptions_coupon_idx').on(table.couponId),
]);

// ─── Regole omaggio ──────────────────────────────────────────────

export const giftRules = pgTable('gift_rules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  triggerType: varchar('trigger_type', { length: 30 }).notNull(), // 'amount' | 'product' | 'category'
  triggerValue: decimal('trigger_value', { precision: 10, scale: 2 }),
  triggerProductId: integer('trigger_product_id').references(() => products.id),
  triggerCategoryId: integer('trigger_category_id').references(() => productCategories.id),
  giftProductId: integer('gift_product_id').references(() => products.id).notNull(),
  giftQty: integer('gift_qty').default(1).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Unità di misura ─────────────────────────────────────────────

export const unitOfMeasure = pgTable('unit_of_measure', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// ─── Prezzi a volume (scalare) ───────────────────────────────────

export const volumePricing = pgTable('volume_pricing', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  minQty: integer('min_qty').notNull(),
  maxQty: integer('max_qty'),
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }),
  priceOverride: decimal('price_override', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('volume_pricing_product_idx').on(table.productId),
]);

// ─── Contratti cliente ───────────────────────────────────────────

export const customerContracts = pgTable('customer_contracts', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  priceListId: integer('price_list_id').references(() => priceLists.id),
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }).default('0'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('customer_contracts_customer_idx').on(table.customerId),
]);

// ─── Sinonimi di ricerca ─────────────────────────────────────────

export const searchSynonyms = pgTable('search_synonyms', {
  id: serial('id').primaryKey(),
  term: varchar('term', { length: 100 }).notNull(),
  synonyms: text('synonyms').notNull(), // comma-separated
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Messaggi utenti ─────────────────────────────────────────────

export const userMessages = pgTable('user_messages', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('banner'), // 'banner' | 'popup' | 'email'
  targetType: varchar('target_type', { length: 20 }).notNull().default('all'), // 'all' | 'category' | 'customer'
  targetId: integer('target_id'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Galleria prodotti (immagini multiple) ───────────────────────

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  altText: varchar('alt_text', { length: 255 }),
  sortOrder: integer('sort_order').default(0),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('product_images_product_idx').on(table.productId),
]);

// ─── Tracking visualizzazioni ────────────────────────────────────

export const productViews = pgTable('product_views', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  sessionId: varchar('session_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('product_views_product_idx').on(table.productId),
  index('product_views_created_idx').on(table.createdAt),
]);

export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  path: varchar('path', { length: 500 }).notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  sessionId: varchar('session_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('page_views_path_idx').on(table.path),
  index('page_views_created_idx').on(table.createdAt),
]);

// ─── Cataloghi ───────────────────────────────────────────────────

export const catalogs = pgTable('catalogs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Product Relations (up-sell, cross-sell, accessories) ────────
export const productRelations = pgTable('product_relations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  relatedProductId: integer('related_product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  relationType: varchar('relation_type', { length: 20 }).notNull(), // 'upsell' | 'crosssell' | 'accessory' | 'similar'
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('product_relations_product_idx').on(table.productId),
  index('product_relations_type_idx').on(table.relationType),
  uniqueIndex('product_relations_unique_idx').on(table.productId, table.relatedProductId, table.relationType),
]);

// ─── Campaigns (marketing campaigns) ───────────────────────────────

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 30 }).notNull(), // 'email' | 'banner' | 'discount' | 'bundle'
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'active' | 'paused' | 'completed'
  targetType: varchar('target_type', { length: 30 }).notNull().default('all'), // 'all' | 'segment' | 'purchased_product' | 'purchased_category' | 'inactive_customers' | 'top_spenders'
  targetValue: text('target_value'), // JSON string with targeting criteria
  discountType: varchar('discount_type', { length: 20 }), // 'percentage' | 'fixed' | 'free_shipping'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  emailSubject: varchar('email_subject', { length: 500 }),
  emailBody: text('email_body'),
  bannerImageUrl: text('banner_image_url'),
  bannerLink: text('banner_link'),
  sentCount: integer('sent_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  conversionCount: integer('conversion_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('campaigns_status_idx').on(table.status),
  index('campaigns_type_idx').on(table.type),
  index('campaigns_start_date_idx').on(table.startDate),
  index('campaigns_end_date_idx').on(table.endDate),
]);

// ─── Campaign Products (products linked to campaigns) ────────────

export const campaignProducts = pgTable('campaign_products', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('campaign_products_campaign_idx').on(table.campaignId),
]);

// ─── Relations for Product Relations and Campaigns ────────────────

export const productRelationsRelations = relations(productRelations, ({ one }) => ({
  product: one(products, { fields: [productRelations.productId], references: [products.id] }),
  relatedProduct: one(products, { fields: [productRelations.relatedProductId], references: [products.id], relationName: 'relatedProduct' }),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  campaignProducts: many(campaignProducts),
}));

export const campaignProductsRelations = relations(campaignProducts, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignProducts.campaignId], references: [campaigns.id] }),
  product: one(products, { fields: [campaignProducts.productId], references: [products.id] }),
}));

// ─── Types ─────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type CustomerNote = typeof customerNotes.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type ShippingRule = typeof shippingRules.$inferSelect;
export type BulkySurcharge = typeof bulkySurcharges.$inferSelect;
export type ShippingZone = typeof shippingZones.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type GiftRule = typeof giftRules.$inferSelect;
export type VolumePricing = typeof volumePricing.$inferSelect;
export type CustomerContract = typeof customerContracts.$inferSelect;
export type SearchSynonym = typeof searchSynonyms.$inferSelect;
export type UserMessage = typeof userMessages.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Catalog = typeof catalogs.$inferSelect;
export type ProductRelation = typeof productRelations.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignProduct = typeof campaignProducts.$inferSelect;
