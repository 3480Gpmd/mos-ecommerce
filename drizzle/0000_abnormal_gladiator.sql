CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_sync_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" integer NOT NULL,
	"action" varchar(30) NOT NULL,
	"payload" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "csv_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'running' NOT NULL,
	"total_rows" integer DEFAULT 0,
	"products_new" integer DEFAULT 0,
	"products_updated" integer DEFAULT 0,
	"products_deactivated" integer DEFAULT 0,
	"errors" integer DEFAULT 0,
	"error_log" text,
	"duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"company_name" varchar(255),
	"customer_type" varchar(20) DEFAULT 'privato' NOT NULL,
	"vat_number" varchar(20),
	"fiscal_code" varchar(20),
	"sdi_code" varchar(10),
	"pec_email" varchar(255),
	"phone" varchar(30),
	"address" text,
	"postcode" varchar(10),
	"city" varchar(100),
	"province" varchar(5),
	"price_list" varchar(50) DEFAULT 'standard',
	"easyfatt_code" varchar(50),
	"crm_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_code" varchar(100) NOT NULL,
	"product_name" text NOT NULL,
	"product_brand" varchar(255),
	"unit" varchar(20) DEFAULT 'PZ',
	"qty" integer NOT NULL,
	"price_unit" numeric(10, 2) NOT NULL,
	"discount_pct" numeric(5, 2) DEFAULT '0',
	"vat_pct" numeric(5, 2) NOT NULL,
	"line_total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"customer_id" integer NOT NULL,
	"customer_name" varchar(255),
	"customer_email" varchar(255),
	"customer_vat" varchar(20),
	"customer_fiscal" varchar(20),
	"shipping_address" text,
	"shipping_postcode" varchar(10),
	"shipping_city" varchar(100),
	"shipping_province" varchar(5),
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"payment_method" varchar(30),
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_ref" varchar(255),
	"status" varchar(30) DEFAULT 'nuovo' NOT NULL,
	"notes" text,
	"admin_notes" text,
	"easyfatt_exported" boolean DEFAULT false NOT NULL,
	"easyfatt_date" timestamp,
	"crm_order_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"group_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_groups_code_unique" UNIQUE("code"),
	CONSTRAINT "product_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_subcategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_subcategories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" text NOT NULL,
	"brand" varchar(255),
	"part_number" varchar(255),
	"barcode" varchar(100),
	"description" text,
	"unit" varchar(20) DEFAULT 'PZ',
	"price_public" numeric(10, 2),
	"price_net" numeric(10, 2) NOT NULL,
	"vat_code" numeric(5, 2) DEFAULT '22' NOT NULL,
	"stock_available" integer DEFAULT 0,
	"stock_ordered" integer DEFAULT 0,
	"stock_arrival_date" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_manual" boolean DEFAULT false NOT NULL,
	"is_promo" boolean DEFAULT false NOT NULL,
	"is_exhausting" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"image_custom" text,
	"group_id" integer,
	"category_id" integer,
	"subcategory_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_group_id_product_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_subcategories" ADD CONSTRAINT "product_subcategories_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_group_id_product_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_idx" ON "cart_items" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE INDEX "crm_sync_queue_status_idx" ON "crm_sync_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_sync_queue_entity_idx" ON "crm_sync_queue" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customers_type_idx" ON "customers" USING btree ("customer_type");--> statement-breakpoint
CREATE INDEX "customers_crm_idx" ON "customers" USING btree ("crm_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_categories_code_idx" ON "product_categories" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_categories_group_idx" ON "product_categories" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_groups_code_idx" ON "product_groups" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "product_subcategories_code_idx" ON "product_subcategories" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_subcategories_category_idx" ON "product_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_code_idx" ON "products" USING btree ("code");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "products_group_idx" ON "products" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_subcategory_idx" ON "products" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_unique_idx" ON "wishlists" USING btree ("customer_id","product_id");