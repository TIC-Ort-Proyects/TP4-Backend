import { Client } from 'pg'
import { config } from '../dbconfig.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export async function signup(req, res, next) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'username y password son requeridos' });
    }
    const client = new Client(config);
    await client.connect();

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ userId, username, role: "user" }, process.env.JWT_SECRET, { expiresIn: '1h' });

    try {
        await client.query(
            'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, username, hashedPassword, "user"]
        );
        res
        .cookie('session_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 3600000 })
        .status(201)
        .json({ success: true, message: "Register successful", token });
    } catch (error) {
        if (error.code === '23505') {
            res.status(409).json({ success: false, message: 'El usuario ya existe' });
        } else {
            next(error);
        }
    } finally {
        await client.end();
    }
}

export async function signin(req, res) {
    const client = new Client(config);
    await client.connect();

    const { username, password } = req.body;

    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res
            .cookie('session_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 3600000 })
            .status(200)
            .json({ success: true, message: 'Login successful', token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        await client.end();
    }
}