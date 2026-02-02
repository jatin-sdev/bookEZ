-- Create the parent partitioned table
CREATE TABLE IF NOT EXISTS "event_seats" (
  "event_id" uuid NOT NULL,
  "seat_id" uuid NOT NULL,
  "section_id" uuid NOT NULL,
  "user_id" uuid,
  "status" "seat_status" DEFAULT 'AVAILABLE' NOT NULL,
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "event_seats_pk" PRIMARY KEY ("event_id", "seat_id")
) PARTITION BY LIST ("event_id");

-- Create indexes on the parent (propagates to partitions)
CREATE INDEX IF NOT EXISTS "idx_event_seats_lookup" ON "event_seats" ("event_id", "section_id", "status");