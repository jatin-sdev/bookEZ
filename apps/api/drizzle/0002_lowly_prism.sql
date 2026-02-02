CREATE TABLE "event_seats" (
	"event_id" uuid NOT NULL,
	"seat_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"user_id" uuid,
	"status" "seat_status" DEFAULT 'AVAILABLE' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "event_seats_event_id_seat_id_pk" PRIMARY KEY("event_id","seat_id")
);
--> statement-breakpoint
DROP INDEX "idx_seats_section_status";--> statement-breakpoint
ALTER TABLE "event_seats" ADD CONSTRAINT "event_seats_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_seats" ADD CONSTRAINT "event_seats_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_seats" ADD CONSTRAINT "event_seats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_event_seats_lookup" ON "event_seats" USING btree ("event_id","section_id","status");--> statement-breakpoint
CREATE INDEX "idx_seats_section" ON "seats" USING btree ("section_id");--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "status";