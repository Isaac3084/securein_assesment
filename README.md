# Culinary Compass

Welcome to **Culinary Compass**! This project takes a massive collection of US recipes and turns them into a beautiful, easy-to-explore web app.

It's built with a robust Node.js & PostgreSQL backend to handle the data heavy-lifting, and a polished React frontend that makes finding your next meal a joy.

## How it works
We take a large JSON file of recipes, clean it up, and store it in a database. Then, our API lets the frontend fetch exactly what you need—whether you're looking for a quick 30-minute dinner or a specific low-calorie dessert.

## Tech Stack
*   **Backend**: Node.js, Express, PostgreSQL
*   **Frontend**: React (Vite), Custom CSS
*   **Data**: PostgreSQL (using JSONB for flexible nutrient data)

## Getting Started

### 1. Database Setup & Schema
First, make sure you have PostgreSQL running. We've provided scripts to make setup a breeze, but here is the raw SQL schema if you want to see how the sausage is made (or create the table manually):

**SQL Schema (`database/schema.sql`):**
```sql
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    cuisine VARCHAR,
    rating FLOAT,
    prep_time INTEGER,
    cook_time INTEGER,
    total_time INTEGER,
    description TEXT,
    nutrients JSONB, -- Stores flexible data like calories, fat, etc.
    serves VARCHAR
);

-- Indices for fast searching
CREATE INDEX idx_nutrients ON recipes USING GIN (nutrients);
CREATE INDEX idx_rating ON recipes(rating);
```

**Automated Setup Scripts:**
We have handy Node scripts to do this for you:
*   `node scripts/init_db.js`: Runs the schema SQL to create the table.
*   `node scripts/import_data.js`: Reads the JSON file, cleans the data, and batch inserts it into the DB.

### 2. How to Run the Project
**Step A: Start the Backend**
```bash
cd backend
npm install
node server.js
```
*   Server runs on: `http://localhost:3000`

**Step B: Start the Frontend**
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*   App runs on: `http://localhost:5173`

### 3. API Testing & Examples
Want to test the backend directly? Here are some simple `curl` commands (or use Postman) to verify things are working.

**Get All Recipes (Paginated)**
Fetch the first 10 recipes, sorted by rating.

**Request:**
```bash
GET http://localhost:3000/api/recipes?page=1&limit=10
```

**Response (Sample):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 8244,
  "data": [
    {
      "id": 1,
      "title": "Perfect Roast Chicken",
      "rating": 5.0,
      "cuisine": "American",
      ...
    }
  ]
}
```

**Search & Filter**
Find high-rated recipes with less than 500 calories.

**Request:**
```bash
GET http://localhost:3000/api/recipes/search?rating=>=4.5&calories=<=500
```

**Response:**
Returns a list of recipes matching *all* criteria. The `calories` filter intelligently queries inside the JSONB `nutrients` column!

## Key Features
*   **Browse**: Scroll through thousands of recipes with a clean key information view.
*   **Search & Filter**: Find exactly what you want. Try searching for "Pasta" or filter by `Calories <= 500`.
*   **Deep Dive**: Click any recipe to open a drawer with full details, including cooking times and a complete nutrition breakdown.
*   **Design**: Built with a focus on aesthetics—clean lines, smooth animations, and a modern feel.

Enjoy cooking!
