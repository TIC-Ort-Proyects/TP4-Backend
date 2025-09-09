import {config} from './dbconfig.js'
import express from "express";
import 'dotenv/config'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import pkg from 'pg'
const {Client} = pkg;

const app = express()
const PORT = 8000

app.use(express.json());

app.post('/signup', async (req, res) => {
    const client = new Client(config);
    await client.connect();

    const { username, password } = req.body;
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    try {
        const result = await client.query('INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *', [userId, username, hashedPassword]);
        res.status(201).json({ success: true, message: "Register successful", token });
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        await client.end();
    }
})

app.get('/listen', async (req, res) => {
    // Autenticación por token (igual estilo que otras rutas)
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ success:false, message:'Falta header Authorization Bearer' });
    }
    let payload;
    try {
        const token = authHeader.split(' ')[1];
        payload = jwt.verify(token, process.env.JWT_SECRET); // { userId, username, iat, exp }
    } catch (err) {
        return res.status(401).json({ success:false, message:'Token inválido o expirado' });
    }

    const client = new Client(config);
    await client.connect();

    const userId = payload.userId;
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
        res.status(200).json({
            success: true,
            songs: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo listens agregados:', error);
        res.status(500).json({ success:false, message:'Internal Server Error' });
    } finally {
        await client.end();
    }
})

app.post('/signin', async (req, res) => {
    const client = new Client(config);
    await client.connect();

    const { username, password } = req.body;

    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ success: true, message: 'Login successful', token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        await client.end();
    }
})

app.post('/listen', async (req, res) => {
    // Extraer y validar token (sin middleware global)
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ success:false, message:'Falta header Authorization Bearer' });
    }
    let payload;
    try {
        const token = authHeader.split(' ')[1];
        payload = jwt.verify(token, process.env.JWT_SECRET); // { userId, username, iat, exp }
    } catch (err) {
        return res.status(401).json({ success:false, message:'Token inválido o expirado' });
    }

    const client = new Client(config);
    await client.connect();

    const { songId } = req.body;
    if(!songId){
        await client.end();
        return res.status(400).json({success:false, message:'songId requerido'});
    }

    const userId = payload.userId;
    const listenId = crypto.randomUUID();
    const listenedAt = new Date();

    try {
        const result = await client.query(
            'INSERT INTO songlisten (id, song_id, user_id, listened_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [listenId, songId, userId, listenedAt]
        );
        res.status(201).json({ success: true, message: "Listen recorded", listen: result.rows[0] });
    } catch (error) {
        console.error('Error recording listen:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        await client.end();
    }
})

app.post('/seed', async (req, res) => {
    const client = new Client(config);
    await client.connect();

    const passwordPlain = 'password123';
    const userId = crypto.randomUUID();
    const song1Id = crypto.randomUUID();
    const song2Id = crypto.randomUUID();
    const listen1Id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    // Dropeamos versiones previas incompatibles
    const statements = [
        'DROP TABLE IF EXISTS songlisten CASCADE;',
        'DROP TABLE IF EXISTS song CASCADE;',
        'DROP TABLE IF EXISTS users CASCADE;',
        `CREATE TABLE users (
            id UUID PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
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
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en seed:', error);
        res.status(500).json({ success: false, message: 'Error creando schema' });
    } finally {
        await client.end();
    }
});

app.get('/', (_, res) => {
    res.send('Hello World')
})

app.get('/about', (_, res) => {
    res.send('About route 🎉 ')
})

app.get('/songs', async (req, res) => {
    const client = new Client(config);
    await client.connect();
    let result = await client.query("select * from public.song");
    await client.end();
    console.log(result.rows);
    res.send(result.rows);

})

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
})