-- Custom SQL migration for Day 4 Optimization
-- 1. Create index for fast seat lookups by section
CREATE INDEX IF NOT EXISTS "idx_seats_section_status" ON "seats" ("section_id", "status");

-- 2. (Optional) Comment on Partitioning Strategy
-- In a full production environment (Postgres 13+), we would convert the seats table 
-- to be PARTITION BY LIST (venue_id) to handle millions of rows. 
-- For this stage, the index above provides sufficient performance.