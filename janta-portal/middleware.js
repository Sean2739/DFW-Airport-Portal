import { NextResponse } from 'next/server';

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' lets nonced scripts load further scripts (Next.js code-splitting).
    // 'self' is a fallback for browsers without nonce support.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // 'unsafe-inline' is required because the app has ~336 inline style={{ }} props
    // (e.g. dashboard.js alone has 118). Next.js SSR renders these as style="" HTML
    // attributes, and browsers enforce style-src on them. To remove this directive,
    // convert all inline style props to Tailwind utility classes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src blob: 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Pass nonce to server components via request header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy',        csp);
  response.headers.set('X-Frame-Options',                'DENY');
  response.headers.set('X-Content-Type-Options',          'nosniff');
  response.headers.set('Permissions-Policy',              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()');
  response.headers.set('Cross-Origin-Embedder-Policy',    'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy',      'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy',    'same-origin');
  response.headers.set('Referrer-Policy',                 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
