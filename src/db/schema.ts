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

  isActive: boolean('is_active').default(true).notNull(),
  isManual: boolean('is_manual').default(false).notNull(),
  isPromo: boolean('is_promo').default(false).notNull(),
  isExhausting: boolean('is_exhausting').default(false).notNull(),

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
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  companyName: varchar('company_name', { length: 255 }),
  customerType: varchar('customer_type', { length: 20 }).notNull().default('privato'), // 'privato' | 'azienda'
  vatNumber: varchar('vat_number', { length: 20 }),
  fiscalCode: varchar('fiscal_code', { length: 20 }),
  sdiCode: varchar('sdi_code', { length: 10 }),
  pecEmail: varchar('pec_email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
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
