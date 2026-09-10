import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  DEV_BYPASS_PASSWORD,
  DEV_BYPASS_USER,
  getJwtSecret,
  isDevAuthBypass,
  signDevSessionPayload,
} from '@/lib/devAuth';

export const dynamic = 'force-dynamic';

function setSessionCookie(response, token) {
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 Days
  });
  return response;
}

export async function POST(request) {
  try {
    const JWT_SECRET = getJwtSecret();
    
    const loginSchema = z.object({
      email: z.string().email().max(254).transform(e => e.toLowerCase()),
      password: z.string().min(1).max(128)
    });

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // LOCAL DEV ONLY — ignored in production. See src/lib/devAuth.js
    if (isDevAuthBypass()) {
      if (email === DEV_BYPASS_USER.email && password === DEV_BYPASS_PASSWORD) {
        const token = jwt.sign(signDevSessionPayload(), JWT_SECRET, { expiresIn: '7d' });
        return setSessionCookie(NextResponse.json({ success: true }), token);
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Fetch user by email
    const user = await prisma.customer.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive',
        }
       },
      include: {setting: true}
    });

    const fakeHash = '$2b$10$C6UzMDM.H6dfI/f/IKcEe.ejJ9z2ZzZzZzZzZzZzZzZzZzZzZz';
    if (!user) {
      await bcrypt.compare(password, fakeHash);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last_login timestamp
    /* if (user.setting) {
      await prisma.settings.update({
        where: { settings_id: user.setting.settings_id },
        data: { last_login: new Date() },
      });
    } */
    await prisma.settings.upsert({
      where: { customer_id: user.id },
      update: { last_login: new Date() },
      create: { customer_id: user.id, last_login: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        planTier: user.planTier,
        activeSystemId: null, // initially null
        forcePasswordReset: Boolean(user.force_password_reset),
      },
      JWT_SECRET,
      { expiresIn: '7d' } // adjust session duration
    );

    const response = NextResponse.json({ success: true });
    return setSessionCookie(response, token);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}