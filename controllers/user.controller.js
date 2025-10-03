import { createUser, getUserByUsername } from '../services/user.service.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function signup(req, res, next) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'username y password son requeridos' });
    }
    try {
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'El usuario ya existe' });
        }
        const user = await createUser({ username, password });
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res
            .cookie('session_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 3600000 })
            .status(201)
            .json({ success: true, message: "Register successful", token });
    } catch (error) {
        next(error);
    }
}

export async function signin(req, res) {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);
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
    }
}