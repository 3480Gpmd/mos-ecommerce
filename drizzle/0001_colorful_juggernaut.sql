CREATE TABLE "category_markups" (
	"id" serial PRIMARY KEY NOT NULL,
	"price_list_id" integer NOT NULL,
	"group_id" integer,
	"category_id" integer,
	"subcategory_id" integer,
	"markup_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"discount_pct" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"discount_pct" numeric(5, 2) DEFAULT '0',
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_lists_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "special_discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(30) NOT NULL,
	"product_id" integer,
	"group_id" integer,
	"category_id" integer,
	"customer_id" integer,
	"price_list_id" integer,
	"discount_pct" numeric(5, 2) DEFAULT '0',
	"fixed_price" numeric(10, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "category_markups" ADD CONSTRAINT "category_markups_price_list_id_price_lists_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_markups" ADD CONSTRAINT "category_markups_group_id_product_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_markups" ADD CONSTRAINT "category_markups_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_markups" ADD CONSTRAINT "category_markups_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_discounts" ADD CONSTRAINT "special_discounts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_discounts" ADD CONSTRAINT "special_discounts_group_id_product_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_discounts" ADD CONSTRAINT "special_discounts_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_discounts" ADD CONSTRAINT "special_discounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_discounts" ADD CONSTRAINT "special_discounts_price_list_id_price_lists_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_markups_list_idx" ON "category_markups" USING btree ("price_list_id");--> statement-breakpoint
CREATE INDEX "category_markups_group_idx" ON "category_markups" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "category_markups_category_idx" ON "category_markups" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "price_lists_code_idx" ON "price_lists" USING btree ("code");--> statement-breakpoint
CREATE INDEX "special_discounts_type_idx" ON "special_discounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "special_discounts_product_idx" ON "special_discounts" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "special_discounts_customer_idx" ON "special_discounts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "special_discounts_active_idx" ON "special_discounts" USING btree ("is_active");