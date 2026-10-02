-- =========================================================================
-- WorkBloom Travel Module - Destination seed data (verified real coordinates)
-- =========================================================================
-- Idempotent: uses ON CONFLICT (name) DO NOTHING, since Destination.name
-- has a unique constraint (see Destination entity). Safe to re-run.
--
-- Run with:
--   psql -U postgres -d workbloom -f database/seed/02_destinations.sql
-- =========================================================================

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Manali', 'A pine-forested hill town in the Himalayas, popular for trekking, river valleys and snow-capped views.', 'India', 'Himachal Pradesh', 'Manali', 32.2396, 77.1887, 'March to June, October to February', 'MOUNTAINS', 'MOUNTAINS', 'MODERATE', 'SHORT', '/images/destinations/manali-1.svg', '/images/destinations/manali-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Manali'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Manali'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Manali'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Manali'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Shimla', 'The former British summer capital, with colonial architecture, pine forests and easy mountain walks.', 'India', 'Himachal Pradesh', 'Shimla', 31.1048, 77.1734, 'March to June, December to February', 'MOUNTAINS', 'MOUNTAINS', 'MODERATE', 'WEEKEND', '/images/destinations/shimla-1.svg', '/images/destinations/shimla-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Shimla'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Shimla'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Shimla'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Shimla'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Munnar', 'Rolling tea plantations and misty hills in the Western Ghats of Kerala.', 'India', 'Kerala', 'Munnar', 10.0889, 77.0595, 'September to March', 'NATURE', 'MOUNTAINS', 'MODERATE', 'SHORT', '/images/destinations/munnar-1.svg', '/images/destinations/munnar-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Munnar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Munnar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Munnar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WILDLIFE' FROM destinations d
WHERE d.name = 'Munnar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WILDLIFE'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Ooty', 'A colonial hill station in the Nilgiris known for botanical gardens and a toy train.', 'India', 'Tamil Nadu', 'Ooty', 11.4064, 76.6932, 'October to June', 'NATURE', 'MOUNTAINS', 'MODERATE', 'WEEKEND', '/images/destinations/ooty-1.svg', '/images/destinations/ooty-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Ooty'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Ooty'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Ooty'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Ooty'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Darjeeling', 'Tea gardens and Himalayan views, famous for the Darjeeling Himalayan Railway.', 'India', 'West Bengal', 'Darjeeling', 27.041, 88.2663, 'March to May, October to November', 'NATURE', 'MOUNTAINS', 'MODERATE', 'SHORT', '/images/destinations/darjeeling-1.svg', '/images/destinations/darjeeling-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Darjeeling'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Darjeeling'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Darjeeling'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Darjeeling'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Leh', 'A high-altitude desert landscape in Ladakh with monasteries, mountain passes and stark beauty.', 'India', 'Ladakh', 'Leh', 34.1526, 77.5771, 'May to September', 'ADVENTURE', 'MOUNTAINS', 'PREMIUM', 'LONG', '/images/destinations/leh-1.svg', '/images/destinations/leh-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Leh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Leh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Leh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Leh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Rishikesh', 'The ''Yoga Capital of the World'', on the banks of the Ganges at the Himalayan foothills.', 'India', 'Uttarakhand', 'Rishikesh', 30.0869, 78.2676, 'September to November, February to April', 'SPIRITUAL', 'NATURE', 'BUDGET', 'SHORT', '/images/destinations/rishikesh-1.svg', '/images/destinations/rishikesh-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Rishikesh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Rishikesh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'SPA' FROM destinations d
WHERE d.name = 'Rishikesh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'SPA'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WATER SPORTS' FROM destinations d
WHERE d.name = 'Rishikesh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WATER SPORTS'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Rishikesh'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Goa', 'India''s best-known beach destination, with a laid-back Indo-Portuguese coastal culture.', 'India', 'Goa', 'Panaji', 15.2993, 74.124, 'November to February', 'BEACH', 'BEACH', 'MODERATE', 'WEEKEND', '/images/destinations/goa-1.svg', '/images/destinations/goa-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Goa'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Goa'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WATER SPORTS' FROM destinations d
WHERE d.name = 'Goa'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WATER SPORTS'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Goa'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Goa'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Alleppey', 'Kerala''s backwater capital, best explored slowly by houseboat through palm-fringed canals.', 'India', 'Kerala', 'Alappuzha', 9.4981, 76.3388, 'November to February', 'RELAXATION', 'NATURE', 'MODERATE', 'SHORT', '/images/destinations/alleppey-1.svg', '/images/destinations/alleppey-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Alleppey'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WATER SPORTS' FROM destinations d
WHERE d.name = 'Alleppey'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WATER SPORTS'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Alleppey'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Alleppey'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Jaipur', 'The ''Pink City'', with Rajput palaces, forts and a lively old-city bazaar.', 'India', 'Rajasthan', 'Jaipur', 26.9124, 75.7873, 'October to March', 'HERITAGE', 'HERITAGE', 'MODERATE', 'SHORT', '/images/destinations/jaipur-1.svg', '/images/destinations/jaipur-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Jaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Jaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Jaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Jaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Jaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Udaipur', 'The ''City of Lakes'', with romantic palaces overlooking Lake Pichola.', 'India', 'Rajasthan', 'Udaipur', 24.5854, 73.7125, 'September to March', 'HERITAGE', 'HERITAGE', 'PREMIUM', 'SHORT', '/images/destinations/udaipur-1.svg', '/images/destinations/udaipur-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Udaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Udaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Udaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Udaipur'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Agra', 'Home to the Taj Mahal and a cluster of Mughal-era monuments.', 'India', 'Uttar Pradesh', 'Agra', 27.1767, 78.0081, 'October to March', 'HERITAGE', 'HERITAGE', 'MODERATE', 'WEEKEND', '/images/destinations/agra-1.svg', '/images/destinations/agra-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Agra'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Agra'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Agra'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Varanasi', 'One of the world''s oldest living cities, on the banks of the Ganges.', 'India', 'Uttar Pradesh', 'Varanasi', 25.3176, 82.9739, 'October to March', 'SPIRITUAL', 'HERITAGE', 'BUDGET', 'WEEKEND', '/images/destinations/varanasi-1.svg', '/images/destinations/varanasi-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Varanasi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Varanasi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Varanasi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Varanasi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Amritsar', 'Home to the Golden Temple and Punjab''s warm, food-forward culture.', 'India', 'Punjab', 'Amritsar', 31.634, 74.8723, 'October to March', 'SPIRITUAL', 'HERITAGE', 'BUDGET', 'WEEKEND', '/images/destinations/amritsar-1.svg', '/images/destinations/amritsar-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Amritsar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Amritsar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Amritsar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Amritsar'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Mysore', 'A city of palaces, silk and sandalwood, in the south of Karnataka.', 'India', 'Karnataka', 'Mysore', 12.2958, 76.6394, 'October to March', 'HERITAGE', 'HERITAGE', 'MODERATE', 'WEEKEND', '/images/destinations/mysore-1.svg', '/images/destinations/mysore-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Mysore'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Mysore'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Mysore'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Hampi', 'The ruins of the Vijayanagara Empire, scattered across a surreal boulder landscape.', 'India', 'Karnataka', 'Hampi', 15.335, 76.46, 'October to February', 'HERITAGE', 'HERITAGE', 'BUDGET', 'SHORT', '/images/destinations/hampi-1.svg', '/images/destinations/hampi-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Hampi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Hampi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Hampi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Pondicherry', 'A former French colony with pastel streets, seafront promenades and a slow pace.', 'India', 'Puducherry', 'Puducherry', 11.9416, 79.8083, 'October to March', 'CULTURAL', 'BEACH', 'MODERATE', 'WEEKEND', '/images/destinations/pondicherry-1.svg', '/images/destinations/pondicherry-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Pondicherry'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Pondicherry'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Pondicherry'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Pondicherry'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Port Blair', 'Gateway to the Andaman Islands, with turquoise waters and coral reefs.', 'India', 'Andaman and Nicobar Islands', 'Port Blair', 11.6234, 92.7265, 'October to May', 'BEACH', 'BEACH', 'PREMIUM', 'LONG', '/images/destinations/port-blair-1.svg', '/images/destinations/port-blair-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Port Blair'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Port Blair'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WATER SPORTS' FROM destinations d
WHERE d.name = 'Port Blair'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WATER SPORTS'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WILDLIFE' FROM destinations d
WHERE d.name = 'Port Blair'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WILDLIFE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Port Blair'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Coorg', 'Coffee plantations and misty hills in Karnataka''s Western Ghats.', 'India', 'Karnataka', 'Madikeri', 12.4244, 75.7382, 'October to March', 'NATURE', 'NATURE', 'MODERATE', 'SHORT', '/images/destinations/coorg-1.svg', '/images/destinations/coorg-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Coorg'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Coorg'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WILDLIFE' FROM destinations d
WHERE d.name = 'Coorg'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WILDLIFE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Coorg'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Kodaikanal', 'A quiet lake-side hill station in the Palani Hills of Tamil Nadu.', 'India', 'Tamil Nadu', 'Kodaikanal', 10.2381, 77.4892, 'October to June', 'NATURE', 'MOUNTAINS', 'MODERATE', 'WEEKEND', '/images/destinations/kodaikanal-1.svg', '/images/destinations/kodaikanal-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Kodaikanal'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Kodaikanal'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Kodaikanal'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Jaisalmer', 'A golden sandstone fort city on the edge of the Thar Desert.', 'India', 'Rajasthan', 'Jaisalmer', 26.9157, 70.9083, 'October to March', 'HERITAGE', 'HERITAGE', 'MODERATE', 'SHORT', '/images/destinations/jaisalmer-1.svg', '/images/destinations/jaisalmer-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Jaisalmer'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Jaisalmer'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Jaisalmer'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Khajuraho', 'UNESCO-listed medieval temples famous for intricate stone carving.', 'India', 'Madhya Pradesh', 'Khajuraho', 24.8318, 79.9199, 'October to March', 'HERITAGE', 'HERITAGE', 'BUDGET', 'WEEKEND', '/images/destinations/khajuraho-1.svg', '/images/destinations/khajuraho-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Khajuraho'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Khajuraho'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Rann of Kutch', 'A vast white salt desert, especially striking under the full moon during Rann Utsav.', 'India', 'Gujarat', 'Bhuj', 23.7337, 69.8597, 'November to February', 'CULTURAL', 'NATURE', 'MODERATE', 'SHORT', '/images/destinations/rann-of-kutch-1.svg', '/images/destinations/rann-of-kutch-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Rann of Kutch'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Rann of Kutch'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Rann of Kutch'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Rann of Kutch'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Gangtok', 'Sikkim''s capital, ringed by Himalayan peaks and Buddhist monasteries.', 'India', 'Sikkim', 'Gangtok', 27.3389, 88.6065, 'March to June, October to mid-December', 'ADVENTURE', 'MOUNTAINS', 'MODERATE', 'SHORT', '/images/destinations/gangtok-1.svg', '/images/destinations/gangtok-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Gangtok'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Gangtok'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Gangtok'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Gangtok'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Nainital', 'A lake-town in the Kumaon Himalayas, popular for boating and easy hikes.', 'India', 'Uttarakhand', 'Nainital', 29.3919, 79.4542, 'March to June, September to November', 'NATURE', 'MOUNTAINS', 'MODERATE', 'WEEKEND', '/images/destinations/nainital-1.svg', '/images/destinations/nainital-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Nainital'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Nainital'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Nainital'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Nainital'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Mount Abu', 'Rajasthan''s only hill station, with Jain marble temples and a cooler climate.', 'India', 'Rajasthan', 'Mount Abu', 24.5926, 72.7156, 'October to March', 'SPIRITUAL', 'MOUNTAINS', 'MODERATE', 'WEEKEND', '/images/destinations/mount-abu-1.svg', '/images/destinations/mount-abu-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Mount Abu'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Mount Abu'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Mount Abu'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Kanyakumari', 'India''s southernmost tip, where three seas meet.', 'India', 'Tamil Nadu', 'Kanyakumari', 8.0883, 77.5385, 'October to March', 'SPIRITUAL', 'BEACH', 'BUDGET', 'WEEKEND', '/images/destinations/kanyakumari-1.svg', '/images/destinations/kanyakumari-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'REFLECTIVE' FROM destinations d
WHERE d.name = 'Kanyakumari'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'REFLECTIVE'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Kanyakumari'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Kanyakumari'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Wayanad', 'Dense forests and wildlife sanctuaries in Kerala''s Western Ghats.', 'India', 'Kerala', 'Wayanad', 11.6854, 76.132, 'October to May', 'ADVENTURE', 'NATURE', 'MODERATE', 'SHORT', '/images/destinations/wayanad-1.svg', '/images/destinations/wayanad-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Wayanad'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'PEACEFUL' FROM destinations d
WHERE d.name = 'Wayanad'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'PEACEFUL'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Wayanad'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'WILDLIFE' FROM destinations d
WHERE d.name = 'Wayanad'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'WILDLIFE'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Auli', 'A Himalayan ski resort with sweeping views of Nanda Devi.', 'India', 'Uttarakhand', 'Auli', 30.5292, 79.567, 'December to March (skiing), May to June', 'ADVENTURE', 'MOUNTAINS', 'PREMIUM', 'SHORT', '/images/destinations/auli-1.svg', '/images/destinations/auli-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Auli'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Auli'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Auli'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Bir Billing', 'One of the world''s best paragliding sites, in the Kangra Valley.', 'India', 'Himachal Pradesh', 'Bir', 32.0463, 76.7168, 'March to June, September to November', 'ADVENTURE', 'MOUNTAINS', 'MODERATE', 'WEEKEND', '/images/destinations/bir-billing-1.svg', '/images/destinations/bir-billing-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'ENERGIZED' FROM destinations d
WHERE d.name = 'Bir Billing'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'ENERGIZED'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'TREKKING' FROM destinations d
WHERE d.name = 'Bir Billing'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'TREKKING'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Bir Billing'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destinations (name, description, country, state, city, latitude, longitude, best_time_to_visit, category, environment, budget_level, duration, image_url, map_image_url, active)
VALUES ('Kochi', 'A historic port city on the Kerala coast blending colonial, Jewish and local heritage.', 'India', 'Kerala', 'Kochi', 9.9312, 76.2673, 'October to March', 'CITY', 'CITY', 'MODERATE', 'WEEKEND', '/images/destinations/kochi-1.svg', '/images/destinations/kochi-map.svg', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO destination_mood_tags (destination_id, mood_tag)
SELECT d.id, 'HAPPY' FROM destinations d
WHERE d.name = 'Kochi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_mood_tags dmt
        WHERE dmt.destination_id = d.id AND dmt.mood_tag = 'HAPPY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'FOOD' FROM destinations d
WHERE d.name = 'Kochi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'FOOD'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'PHOTOGRAPHY' FROM destinations d
WHERE d.name = 'Kochi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'PHOTOGRAPHY'
  );

INSERT INTO destination_activities (destination_id, activity)
SELECT d.id, 'HERITAGE SITES' FROM destinations d
WHERE d.name = 'Kochi'
  AND NOT EXISTS (
        SELECT 1 FROM destination_activities da
        WHERE da.destination_id = d.id AND da.activity = 'HERITAGE SITES'
  );
