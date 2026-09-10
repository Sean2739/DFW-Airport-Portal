import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function clearSessionCookie(response) {
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // immediately expires
  });
}

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  clearSessionCookie(response);
  return response;
}

export async function GET() {
  const response = NextResponse.json({ message: 'Logged out' });
  clearSessionCookie(response);
  return response;
}
