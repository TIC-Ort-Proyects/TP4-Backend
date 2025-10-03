import { Client } from 'pg'
import { config } from '../dbconfig.js'
import crypto from 'crypto'

export async function getSongs() {
    const client = new Client(config);
    await client.connect();
    const result = await client.query("SELECT * FROM public.song");
    await client.end();
    return result.rows;
}

export async function createSong(nombre) {
    const client = new Client(config);
    await client.connect();
    const id = crypto.randomUUID();
    try {
        const result = await client.query(
            'INSERT INTO song (id, name) VALUES ($1, $2) RETURNING *',
            [id, nombre]
        );
        return result.rows[0];
    } finally {
        await client.end();
    }
}

export async function updateSong(id, nombre) {
    const client = new Client(config);
    await client.connect();
    try {
        const result = await client.query(
            'UPDATE song SET name = $1 WHERE id = $2 RETURNING *',
            [nombre, id]
        );
        return result.rows[0];
    } finally {
        await client.end();
    }
}

export async function deleteSong(id) {
    const client = new Client(config);
    await client.connect();
    try {
        const result = await client.query(
            'DELETE FROM song WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    } finally {
        await client.end();
    }
}