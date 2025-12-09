const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASS || 'password',
    port: process.env.DB_PORT || 5432,
});

console.log('DB Config:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

app.get('/api/recipes', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const countResult = await pool.query('SELECT COUNT(*) FROM recipes');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            'SELECT * FROM recipes ORDER BY rating DESC NULLS LAST LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            page,
            limit,
            total,
            data: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/recipes/search', async (req, res) => {
    try {
        const { calories, title, cuisine, total_time, rating } = req.query;
        let query = 'SELECT * FROM recipes WHERE 1=1';
        let values = [];
        let count = 1;

        const parseOperator = (field, param, isJson = false) => {
            const match = param.match(/^([<>]=?|=)?(.+)$/);
            if (!match) return;

            let op = match[1] || '=';
            let val = match[2];

            const validOps = ['=', '>', '<', '>=', '<='];
            if (!validOps.includes(op)) op = '=';

            if (isJson) {
                return ` AND CAST(regexp_replace(nutrients->>'${field}', '[^0-9.]', '', 'g') AS NUMERIC) ${op} $${count++}`;
            } else {
                return ` AND ${field} ${op} $${count++}`;
            }
        };

        if (title) {
            query += ` AND title ILIKE $${count++}`;
            values.push(`%${title}%`);
        }

        if (cuisine) {
            query += ` AND cuisine ILIKE $${count++}`;
            values.push(`%${cuisine}%`);
        }

        if (rating) {
            const match = rating.match(/^([<>]=?|=)?(.+)$/);
            if (match) {
                let op = match[1] || '=';
                let val = parseFloat(match[2]);
                if (['=', '>', '<', '>=', '<='].includes(op)) {
                    query += ` AND rating ${op} $${count++}`;
                    values.push(val);
                }
            }
        }

        if (total_time) {
            const match = total_time.match(/^([<>]=?|=)?(.+)$/);
            if (match) {
                let op = match[1] || '=';
                let val = parseInt(match[2]);
                if (['=', '>', '<', '>=', '<='].includes(op)) {
                    query += ` AND total_time ${op} $${count++}`;
                    values.push(val);
                }
            }
        }

        if (calories) {
            const match = calories.match(/^([<>]=?|=)?(.+)$/);
            if (match) {
                let op = match[1] || '=';
                let val = parseInt(match[2]);
                if (['=', '>', '<', '>=', '<='].includes(op)) {
                    query += ` AND CAST(regexp_replace(nutrients->>'calories', '[^0-9.]', '', 'g') AS NUMERIC) ${op} $${count++}`;
                    values.push(val);
                }
            }
        }

        const result = await pool.query(query, values);
        res.json({ data: result.rows });

    } catch (err) {
        console.error('Search Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
