-- Impact activity banner images.
-- Spring Boot applies this automatically on startup (spring.jpa.hibernate.ddl-auto=update),
-- so running it by hand is only needed if you manage the schema yourself.
-- Backward compatible: nullable column, existing activities simply have no image.
ALTER TABLE volunteer_events
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
