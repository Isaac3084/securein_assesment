const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const StreamObject = require('stream-json/streamers/StreamObject');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

async function importData() {
    const filePath = path.join(__dirname, '../../US_recipes_null.Pdf.json');
    console.log('Reading file:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const client = await pool.connect();
    try {
        console.log('Truncating recipes table...');
        await client.query('TRUNCATE recipes RESTART IDENTITY');
        console.log('Truncated.');
    } finally {
        client.release();
    }

    const pipeline = fs.createReadStream(filePath).pipe(StreamObject.withParser());

    let count = 0;
    const BATCH_SIZE = 1000;
    let batch = [];

    const limitFloat = (val) => {
        if (val === "NaN" || val === undefined || val === null) return null;
        const parsed = parseFloat(val);
        if (Number.isNaN(parsed)) return null;
        return parsed;
    };

    const limitInt = (val) => {
        if (val === "NaN" || val === undefined || val === null) return null;
        const parsed = parseInt(val, 10);
        if (Number.isNaN(parsed)) return null;
        return parsed;
    };

    pipeline.on('data', ({ key, value: recipe }) => {

        if (!recipe.title) {
            return;
        }

        const processed = {
            title: recipe.title,
            cuisine: recipe.cuisine,
            rating: limitFloat(recipe.rating),
            prep_time: limitInt(recipe.prep_time),
            cook_time: limitInt(recipe.cook_time),
            total_time: limitInt(recipe.total_time),
            description: recipe.description,
            nutrients: recipe.nutrients,
            serves: recipe.serves
        };

        batch.push(processed);
        count++;

        if (batch.length >= BATCH_SIZE) {
            insertBatch(batch);
            batch = [];
        }
    });

    pipeline.on('end', async () => {
        if (batch.length > 0) {
            await insertBatch(batch);
        }
        console.log(`\nFinished! Processed ${count} recipes.`);
        setTimeout(() => {
            pool.end();
            process.exit(0);
        }, 1000);
    });

    pipeline.on('error', (err) => {
        console.error('Stream error:', err);
        process.exit(1);
    });
}

async function insertBatch(recipes) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const queryText = `
            INSERT INTO recipes (title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        for (const r of recipes) {
            await client.query(queryText, [
                r.title, r.cuisine, r.rating, r.prep_time, r.cook_time, r.total_time, r.description, r.nutrients, r.serves
            ]);
        }

        await client.query('COMMIT');
        process.stdout.write('.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Batch error:', e);
    } finally {
        client.release();
    }
}

importData();
