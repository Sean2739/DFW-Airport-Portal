import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-strong-secret-key'; // Use env in production

export function signJwt(payload, options = {}) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', ...options });
}

export function verifyJwt(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}
