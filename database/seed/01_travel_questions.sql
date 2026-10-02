-- =========================================================================
-- WorkBloom Travel Module - Question seed data
-- =========================================================================
-- Idempotent: safe to re-run. Requires a unique constraint on
-- travel_questions.question_text (added below if missing) so ON CONFLICT
-- can no-op instead of erroring or duplicating rows.
--
-- Run with:
--   psql -U postgres -d workbloom -f database/seed/01_travel_questions.sql
-- =========================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_travel_questions_text'
    ) THEN
        ALTER TABLE travel_questions
            ADD CONSTRAINT uq_travel_questions_text UNIQUE (question_text);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_travel_question_options_q_value'
    ) THEN
        ALTER TABLE travel_question_options
            ADD CONSTRAINT uq_travel_question_options_q_value UNIQUE (question_id, value);
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- Q1: Emotional state / desired mood
-- -------------------------------------------------------------------------
INSERT INTO travel_questions (question_text, display_order, active)
VALUES ('How are you feeling right now, and what mood are you hoping this trip leaves you with?', 1, true)
ON CONFLICT ON CONSTRAINT uq_travel_questions_text DO NOTHING;

INSERT INTO travel_question_options (question_id, label, value, display_order)
SELECT q.id, v.label, v.value, v.display_order
FROM travel_questions q
CROSS JOIN (VALUES
    ('Peaceful and calm', 'MOOD:PEACEFUL', 1),
    ('Happy and light-hearted', 'MOOD:HAPPY', 2),
    ('Excited and energized', 'MOOD:ENERGIZED', 3),
    ('Reflective and inspired', 'MOOD:REFLECTIVE', 4)
) AS v(label, value, display_order)
WHERE q.question_text = 'How are you feeling right now, and what mood are you hoping this trip leaves you with?'
ON CONFLICT ON CONSTRAINT uq_travel_question_options_q_value DO NOTHING;

-- -------------------------------------------------------------------------
-- Q2: Environment
-- -------------------------------------------------------------------------
INSERT INTO travel_questions (question_text, display_order, active)
VALUES ('Which environment are you drawn to right now?', 2, true)
ON CONFLICT ON CONSTRAINT uq_travel_questions_text DO NOTHING;

INSERT INTO travel_question_options (question_id, label, value, display_order)
SELECT q.id, v.label, v.value, v.display_order
FROM travel_questions q
CROSS JOIN (VALUES
    ('Mountains', 'ENVIRONMENT:MOUNTAINS', 1),
    ('Beach / coast', 'ENVIRONMENT:BEACH', 2),
    ('Forests & nature', 'ENVIRONMENT:NATURE', 3),
    ('Historic / heritage towns', 'ENVIRONMENT:HERITAGE', 4),
    ('City buzz', 'ENVIRONMENT:CITY', 5)
) AS v(label, value, display_order)
WHERE q.question_text = 'Which environment are you drawn to right now?'
ON CONFLICT ON CONSTRAINT uq_travel_question_options_q_value DO NOTHING;

-- -------------------------------------------------------------------------
-- Q3: Trip style
-- -------------------------------------------------------------------------
INSERT INTO travel_questions (question_text, display_order, active)
VALUES ('What kind of trip style suits you best right now?', 3, true)
ON CONFLICT ON CONSTRAINT uq_travel_questions_text DO NOTHING;

INSERT INTO travel_question_options (question_id, label, value, display_order)
SELECT q.id, v.label, v.value, v.display_order
FROM travel_questions q
CROSS JOIN (VALUES
    ('Relaxing and slow-paced', 'TRIPSTYLE:RELAXING', 1),
    ('Adventurous and active', 'TRIPSTYLE:ADVENTURE', 2),
    ('Social and lively', 'TRIPSTYLE:SOCIAL', 3),
    ('Cultural and immersive', 'TRIPSTYLE:CULTURAL', 4),
    ('Spiritual and grounding', 'TRIPSTYLE:SPIRITUAL', 5)
) AS v(label, value, display_order)
WHERE q.question_text = 'What kind of trip style suits you best right now?'
ON CONFLICT ON CONSTRAINT uq_travel_question_options_q_value DO NOTHING;

-- -------------------------------------------------------------------------
-- Q4: Budget
-- -------------------------------------------------------------------------
INSERT INTO travel_questions (question_text, display_order, active)
VALUES ('What budget level are you planning around?', 4, true)
ON CONFLICT ON CONSTRAINT uq_travel_questions_text DO NOTHING;

INSERT INTO travel_question_options (question_id, label, value, display_order)
SELECT q.id, v.label, v.value, v.display_order
FROM travel_questions q
CROSS JOIN (VALUES
    ('Budget-friendly', 'BUDGET:BUDGET', 1),
    ('Moderate', 'BUDGET:MODERATE', 2),
    ('Premium / splurge', 'BUDGET:PREMIUM', 3)
) AS v(label, value, display_order)
WHERE q.question_text = 'What budget level are you planning around?'
ON CONFLICT ON CONSTRAINT uq_travel_question_options_q_value DO NOTHING;

-- -------------------------------------------------------------------------
-- Q5: Duration
-- -------------------------------------------------------------------------
INSERT INTO travel_questions (question_text, display_order, active)
VALUES ('How long are you looking to get away for?', 5, true)
ON CONFLICT ON CONSTRAINT uq_travel_questions_text DO NOTHING;

INSERT INTO travel_question_options (question_id, label, value, display_order)
SELECT q.id, v.label, v.value, v.display_order
FROM travel_questions q
CROSS JOIN (VALUES
    ('A quick weekend', 'DURATION:WEEKEND', 1),
    ('A short trip (3-5 days)', 'DURATION:SHORT', 2),
    ('A longer getaway (6+ days)', 'DURATION:LONG', 3)
) AS v(label, value, display_order)
WHERE q.question_text = 'How long are you looking to get away for?'
ON CONFLICT ON CONSTRAINT uq_travel_question_options_q_value DO NOTHING;

-- -------------------------------------------------------------------------
-- Q6: Activities
-- -------------------------------------------------------------------------
INSERT INTO travel_questions (question_text, display_order, active)
VALUES ('What would you love to spend time doing there?', 6, true)
ON CONFLICT ON CONSTRAINT uq_travel_questions_text DO NOTHING;

INSERT INTO travel_question_options (question_id, label, value, display_order)
SELECT q.id, v.label, v.value, v.display_order
FROM travel_questions q
CROSS JOIN (VALUES
    ('Trekking / hiking', 'ACTIVITY:TREKKING', 1),
    ('Beaches & water sports', 'ACTIVITY:WATER SPORTS', 2),
    ('Wildlife & nature walks', 'ACTIVITY:WILDLIFE', 3),
    ('Temples & heritage sites', 'ACTIVITY:HERITAGE SITES', 4),
    ('Local food & markets', 'ACTIVITY:FOOD', 5),
    ('Spa & wellness retreats', 'ACTIVITY:SPA', 6),
    ('Photography & scenic views', 'ACTIVITY:PHOTOGRAPHY', 7)
) AS v(label, value, display_order)
WHERE q.question_text = 'What would you love to spend time doing there?'
ON CONFLICT ON CONSTRAINT uq_travel_question_options_q_value DO NOTHING;
