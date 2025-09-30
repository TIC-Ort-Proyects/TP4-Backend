import { Client } from 'pg'
import { config } from '../dbconfig.js'
import crypto from 'crypto'

export async function getSongs(req, res) {
    const client = new Client(config);
    await client.connect();
    let result = await client.query("select * from public.song");
    await client.end();
    res.send(result.rows);
}

export async function createSong(req, res) {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'nombre requerido' });
    const client = new Client(config);
    await client.connect();
    const id = crypto.randomUUID();
    try {
        const result = await client.query(
            'INSERT INTO song (id, name) VALUES ($1, $2) RETURNING *',
            [id, nombre]
        );
        res.status(201).json({ success: true, song: result.rows[0] });
    } catch {
        res.status(500).json({ success: false, message: 'Error creando cancion' });
    } finally {
        await client.end();
    }
}

export async function updateSong(req, res) {
    const { id, nombre } = req.body;
    if (!id || !nombre) return res.status(400).json({ success: false, message: 'id y nombre requeridos' });
    const client = new Client(config);
    await client.connect();
    try {
        const result = await client.query(
            'UPDATE song SET name = $1 WHERE id = $2 RETURNING *',
            [nombre, id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Cancion no encontrada' });
        } else {
            res.json({ success: true, song: result.rows[0] });
        }
    } catch {
        res.status(500).json({ success: false, message: 'Error actualizando cancion' });
    } finally {
        await client.end();
    }
}

export async function deleteSong(req, res) {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'id requerido' });
    const client = new Client(config);
    await client.connect();
    try {
        const result = await client.query(
            'DELETE FROM song WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Cancion no encontrada' });
        } else {
            res.json({ success: true, song: result.rows[0] });
        }
    } catch {
        res.status(500).json({ success: false, message: 'Error eliminando cancion' });
    } finally {
        await client.end();
    }
}