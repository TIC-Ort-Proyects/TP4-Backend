import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.session_token) {
        token = req.cookies.session_token;
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Falta token JWT' });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
}

export function verifyAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'No autorizado: rol insuficiente' });
    }
}