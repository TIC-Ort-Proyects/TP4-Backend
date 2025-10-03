import { Client } from 'pg'
import { config } from '../dbconfig.js'
import crypto from 'crypto'

export async function getListens(userId) {
    const client = new Client(config);
    await client.connect();

    const sql = `
        SELECT
            s.id AS song_id,
            s.name AS song_name,
            COUNT(sl.id)::int AS times_listened,
            MAX(sl.listened_at) AS last_listened_at
        FROM songlisten sl
        INNER JOIN song s ON s.id = sl.song_id
        WHERE sl.user_id = $1
        GROUP BY s.id, s.name
        ORDER BY times_listened DESC, last_listened_at DESC;
    `;
    try {
        const result = await client.query(sql, [userId]);
        return result.rows;
    } finally {
        await client.end();
    }
}

export async function addListen({ songId, userId }) {
    const client = new Client(config);
    await client.connect();

    const listenId = crypto.randomUUID();
    const listenedAt = new Date();

    try {
        const result = await client.query(
            'INSERT INTO songlisten (id, song_id, user_id, listened_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [listenId, songId, userId, listenedAt]
        );
        return result.rows[0];
    } finally {
        await client.end();
    }
}