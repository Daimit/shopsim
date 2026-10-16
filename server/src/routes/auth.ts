import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// Simple token generator for simulation environment
const createMockToken = (userId: number, email: string, role: string) => {
  const payload = JSON.stringify({ userId, email, role, ts: Date.now() });
  return Buffer.from(payload).toString('base64');
};

const parseMockToken = (token: string) => {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// GET /api/auth/demo-users - Pre-configured demo accounts for research participants & evaluators
router.get('/demo-users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const demoAccounts = [
      {
        role: 'user',
        name: 'Jane Doe',
        email: 'user@shopsim.test',
        password: 'user123',
        description: 'Standard Shopper / Study Participant',
        badge: 'Shopper',
      },
      {
        role: 'admin',
        name: 'Dr. Sarah Chen',
        email: 'admin@shopsim.test',
        password: 'admin123',
        description: 'Usability Researcher & System Admin',
        badge: 'Administrator',
      },
      {
        role: 'user',
        name: 'Alex Smith',
        email: 'shopper@shopsim.test',
        password: 'password123',
        description: 'Secondary Participant Persona',
        badge: 'Shopper',
      },
    ];

    res.json({
      success: true,
      data: demoAccounts,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Authenticate as user or admin
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;

    // Quick demo login by role if email is omitted
    if (role && !email) {
      const user = await prisma.user.findFirst({
        where: { role: role.toLowerCase() },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: `No demo account found with role '${role}'`,
        });
        return;
      }

      const token = createMockToken(user.id, user.email, user.role);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
          token,
        },
      });
      return;
    }

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. User with this email does not exist.',
      });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.',
      });
      return;
    }

    const token = createMockToken(user.id, user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register - Register a new user or admin
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists',
      });
      return;
    }

    const userRole = role.toLowerCase() === 'admin' ? 'admin' : 'user';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: userRole,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      },
    });

    const token = createMockToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatar: newUser.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Verify session & fetch user profile
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Missing or malformed Authorization header',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const parsed = parseMockToken(token);

    if (!parsed || !parsed.userId) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication session',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
