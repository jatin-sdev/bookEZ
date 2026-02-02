CREATE TYPE "public"."section_type" AS ENUM('ASSIGNED', 'GENERAL_ADMISSION');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "type" "section_type" DEFAULT 'ASSIGNED' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_orders_idempotency" ON "orders" USING btree ("idempotency_key");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");