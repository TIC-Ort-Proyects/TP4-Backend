import { Client } from 'pg'
import { config } from '../dbconfig.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export async function createUser({ username, password }) {
    const client = new Client(config);
    await client.connect();
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await client.query(
            'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, username, hashedPassword, "user"]
        );
        return result.rows[0];
    } finally {
        await client.end();
    }
}

export async function getUserByUsername(username) {
    const client = new Client(config);
    await client.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    } finally {
        await client.end();
    }
}