import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/devAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const JWT_SECRET = getJwtSecret();

  try {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({
      authenticated: true,
      sub: decoded.sub,
      role: decoded.role,
      planTier: decoded.planTier,
      activeSystemId: decoded.activeSystemId || null,
      forcePasswordReset: Boolean(decoded.forcePasswordReset),
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false });
  }
}
