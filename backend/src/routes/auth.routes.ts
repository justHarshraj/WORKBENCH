import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

router.post('/register', async (req: Request, res: Response): Promise<void> => {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);
    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      res.status(400).json({ error: 'Google credential or access_token is required' });
      return;
    }

    let payload: any = null;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });
      payload = ticket.getPayload();
    } else if (access_token) {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!userInfoRes.ok) {
        res.status(400).json({ error: 'Failed to fetch user info with access token' });
        return;
      }
      payload = await userInfoRes.json();
    }

    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token payload' });
      return;
    }

    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture || payload.avatar;
    const googleId = payload.sub;

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, avatar },
        });
      }
    } else {
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
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, email, avatar } = req.body;
    
    // Prevent Mass Assignment by explicitly passing fields
    const updateData = { name, email, avatar };
    Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export default router;
