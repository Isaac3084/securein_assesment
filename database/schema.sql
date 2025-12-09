
DROP TABLE IF EXISTS recipes;

-- Create the recipes table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    cuisine VARCHAR,
    rating FLOAT,
    prep_time INTEGER,
    cook_time INTEGER,
    total_time INTEGER,
    description TEXT,
    nutrients JSONB,
    serves VARCHAR
);

-- Index for searching within JSONB (optional but recommended for performance on large datasets)
CREATE INDEX idx_nutrients ON recipes USING GIN (nutrients);
CREATE INDEX idx_rating ON recipes(rating);
CREATE INDEX idx_total_time ON recipes(total_time);
