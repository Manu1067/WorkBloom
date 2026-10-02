-- =========================================================================
-- WorkBloom Travel Module - Destination image seed data
-- =========================================================================
-- Points at the placeholder images shipped under
-- backend/src/main/resources/static/images/destinations/ .
-- See docs/TRAVEL_IMAGES.md for swapping these for licensed photography.
--
-- Run with:
--   psql -U postgres -d workbloom -f database/seed/03_destination_images.sql
-- =========================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_destination_images_dest_url'
    ) THEN
        ALTER TABLE destination_images
            ADD CONSTRAINT uq_destination_images_dest_url UNIQUE (destination_id, image_url);
    END IF;
END $$;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/manali-1.svg', 'Manali - primary image', true, 1 FROM destinations WHERE name = 'Manali'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/manali-map.svg', 'Manali - map thumbnail', false, 2 FROM destinations WHERE name = 'Manali'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/shimla-1.svg', 'Shimla - primary image', true, 1 FROM destinations WHERE name = 'Shimla'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/shimla-map.svg', 'Shimla - map thumbnail', false, 2 FROM destinations WHERE name = 'Shimla'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/munnar-1.svg', 'Munnar - primary image', true, 1 FROM destinations WHERE name = 'Munnar'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/munnar-map.svg', 'Munnar - map thumbnail', false, 2 FROM destinations WHERE name = 'Munnar'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/ooty-1.svg', 'Ooty - primary image', true, 1 FROM destinations WHERE name = 'Ooty'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/ooty-map.svg', 'Ooty - map thumbnail', false, 2 FROM destinations WHERE name = 'Ooty'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/darjeeling-1.svg', 'Darjeeling - primary image', true, 1 FROM destinations WHERE name = 'Darjeeling'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/darjeeling-map.svg', 'Darjeeling - map thumbnail', false, 2 FROM destinations WHERE name = 'Darjeeling'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/leh-1.svg', 'Leh - primary image', true, 1 FROM destinations WHERE name = 'Leh'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/leh-map.svg', 'Leh - map thumbnail', false, 2 FROM destinations WHERE name = 'Leh'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/rishikesh-1.svg', 'Rishikesh - primary image', true, 1 FROM destinations WHERE name = 'Rishikesh'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/rishikesh-map.svg', 'Rishikesh - map thumbnail', false, 2 FROM destinations WHERE name = 'Rishikesh'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/goa-1.svg', 'Goa - primary image', true, 1 FROM destinations WHERE name = 'Goa'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/goa-map.svg', 'Goa - map thumbnail', false, 2 FROM destinations WHERE name = 'Goa'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/alleppey-1.svg', 'Alleppey - primary image', true, 1 FROM destinations WHERE name = 'Alleppey'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/alleppey-map.svg', 'Alleppey - map thumbnail', false, 2 FROM destinations WHERE name = 'Alleppey'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/jaipur-1.svg', 'Jaipur - primary image', true, 1 FROM destinations WHERE name = 'Jaipur'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/jaipur-map.svg', 'Jaipur - map thumbnail', false, 2 FROM destinations WHERE name = 'Jaipur'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/udaipur-1.svg', 'Udaipur - primary image', true, 1 FROM destinations WHERE name = 'Udaipur'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/udaipur-map.svg', 'Udaipur - map thumbnail', false, 2 FROM destinations WHERE name = 'Udaipur'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/agra-1.svg', 'Agra - primary image', true, 1 FROM destinations WHERE name = 'Agra'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/agra-map.svg', 'Agra - map thumbnail', false, 2 FROM destinations WHERE name = 'Agra'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/varanasi-1.svg', 'Varanasi - primary image', true, 1 FROM destinations WHERE name = 'Varanasi'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/varanasi-map.svg', 'Varanasi - map thumbnail', false, 2 FROM destinations WHERE name = 'Varanasi'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/amritsar-1.svg', 'Amritsar - primary image', true, 1 FROM destinations WHERE name = 'Amritsar'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/amritsar-map.svg', 'Amritsar - map thumbnail', false, 2 FROM destinations WHERE name = 'Amritsar'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/mysore-1.svg', 'Mysore - primary image', true, 1 FROM destinations WHERE name = 'Mysore'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/mysore-map.svg', 'Mysore - map thumbnail', false, 2 FROM destinations WHERE name = 'Mysore'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/hampi-1.svg', 'Hampi - primary image', true, 1 FROM destinations WHERE name = 'Hampi'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/hampi-map.svg', 'Hampi - map thumbnail', false, 2 FROM destinations WHERE name = 'Hampi'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/pondicherry-1.svg', 'Pondicherry - primary image', true, 1 FROM destinations WHERE name = 'Pondicherry'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/pondicherry-map.svg', 'Pondicherry - map thumbnail', false, 2 FROM destinations WHERE name = 'Pondicherry'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/port-blair-1.svg', 'Port Blair - primary image', true, 1 FROM destinations WHERE name = 'Port Blair'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/port-blair-map.svg', 'Port Blair - map thumbnail', false, 2 FROM destinations WHERE name = 'Port Blair'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/coorg-1.svg', 'Coorg - primary image', true, 1 FROM destinations WHERE name = 'Coorg'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/coorg-map.svg', 'Coorg - map thumbnail', false, 2 FROM destinations WHERE name = 'Coorg'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/kodaikanal-1.svg', 'Kodaikanal - primary image', true, 1 FROM destinations WHERE name = 'Kodaikanal'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/kodaikanal-map.svg', 'Kodaikanal - map thumbnail', false, 2 FROM destinations WHERE name = 'Kodaikanal'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/jaisalmer-1.svg', 'Jaisalmer - primary image', true, 1 FROM destinations WHERE name = 'Jaisalmer'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/jaisalmer-map.svg', 'Jaisalmer - map thumbnail', false, 2 FROM destinations WHERE name = 'Jaisalmer'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/khajuraho-1.svg', 'Khajuraho - primary image', true, 1 FROM destinations WHERE name = 'Khajuraho'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/khajuraho-map.svg', 'Khajuraho - map thumbnail', false, 2 FROM destinations WHERE name = 'Khajuraho'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/rann-of-kutch-1.svg', 'Rann of Kutch - primary image', true, 1 FROM destinations WHERE name = 'Rann of Kutch'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/rann-of-kutch-map.svg', 'Rann of Kutch - map thumbnail', false, 2 FROM destinations WHERE name = 'Rann of Kutch'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/gangtok-1.svg', 'Gangtok - primary image', true, 1 FROM destinations WHERE name = 'Gangtok'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/gangtok-map.svg', 'Gangtok - map thumbnail', false, 2 FROM destinations WHERE name = 'Gangtok'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/nainital-1.svg', 'Nainital - primary image', true, 1 FROM destinations WHERE name = 'Nainital'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/nainital-map.svg', 'Nainital - map thumbnail', false, 2 FROM destinations WHERE name = 'Nainital'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/mount-abu-1.svg', 'Mount Abu - primary image', true, 1 FROM destinations WHERE name = 'Mount Abu'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/mount-abu-map.svg', 'Mount Abu - map thumbnail', false, 2 FROM destinations WHERE name = 'Mount Abu'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/kanyakumari-1.svg', 'Kanyakumari - primary image', true, 1 FROM destinations WHERE name = 'Kanyakumari'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/kanyakumari-map.svg', 'Kanyakumari - map thumbnail', false, 2 FROM destinations WHERE name = 'Kanyakumari'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/wayanad-1.svg', 'Wayanad - primary image', true, 1 FROM destinations WHERE name = 'Wayanad'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/wayanad-map.svg', 'Wayanad - map thumbnail', false, 2 FROM destinations WHERE name = 'Wayanad'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/auli-1.svg', 'Auli - primary image', true, 1 FROM destinations WHERE name = 'Auli'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/auli-map.svg', 'Auli - map thumbnail', false, 2 FROM destinations WHERE name = 'Auli'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/bir-billing-1.svg', 'Bir Billing - primary image', true, 1 FROM destinations WHERE name = 'Bir Billing'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/bir-billing-map.svg', 'Bir Billing - map thumbnail', false, 2 FROM destinations WHERE name = 'Bir Billing'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/kochi-1.svg', 'Kochi - primary image', true, 1 FROM destinations WHERE name = 'Kochi'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;

INSERT INTO destination_images (destination_id, image_url, alt_text, primary_image, display_order)
SELECT id, '/images/destinations/kochi-map.svg', 'Kochi - map thumbnail', false, 2 FROM destinations WHERE name = 'Kochi'
ON CONFLICT ON CONSTRAINT uq_destination_images_dest_url DO NOTHING;
