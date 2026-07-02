"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const google_auth_library_1 = require("google-auth-library");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        const token = generateToken(user.id);
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user.id);
        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            res.status(400).json({ error: 'Google credential is required' });
            return;
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: 'Invalid Google token payload' });
            return;
        }
        const { sub: googleId, email, name, picture: avatar } = payload;
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { email },
                    data: { googleId, avatar },
                });
            }
        }
        else {
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    name,
                    avatar,
                },
            });
        }
        const token = generateToken(user.id);
        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    }
    catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name, email, avatar } = req.body;
        // Prevent Mass Assignment by explicitly passing fields
        const updateData = { name, email, avatar };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
        });
        res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // P2002: Unique constraint failed
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Email is already in use by another account' });
                return;
            }
        }
        console.error('Update me error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map