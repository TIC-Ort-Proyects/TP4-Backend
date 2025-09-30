import { Client } from 'pg'
import { config } from '../dbconfig.js'

export async function seed(req, res) {
    const client = new Client(config);
    await client.connect();

    const statements = [
        'DROP TABLE IF EXISTS songlisten CASCADE;',
        'DROP TABLE IF EXISTS song CASCADE;',
        'DROP TABLE IF EXISTS users CASCADE;',
        `CREATE TABLE users (
            id UUID PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );`,
        `CREATE TABLE song (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL
        );`,
        `CREATE TABLE songlisten (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            song_id UUID NOT NULL REFERENCES song(id) ON DELETE CASCADE,
            listened_at TIMESTAMPTZ DEFAULT NOW()
        );`,
        `CREATE INDEX IF NOT EXISTS idx_songlisten_user_id ON songlisten(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_songlisten_song_id ON songlisten(song_id);`
    ];

    try {
        await client.query('BEGIN');
        for (const stmt of statements) {
            await client.query(stmt);
        }
        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: 'Schema creado.',
        });
    } catch {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Error creando schema' });
    } finally {
        await client.end();
    }
}