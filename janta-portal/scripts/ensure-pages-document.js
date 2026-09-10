#!/usr/bin/env node
/**
 * Ensures pages/_document.js exists at BOTH root and src (for Docker/build).
 * Next.js 404 prerender can resolve to either; writing both fixes
 * "Html should not be imported outside of pages/_document" error.
 */
const fs = require('fs');
const path = require('path');

const content = `import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
`;

const cwd = process.cwd();
const locations = [
  path.join(cwd, 'pages', '_document.js'),
  path.join(cwd, 'src', 'pages', '_document.js'),
];

for (const file of locations) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log('Written:', file);
}
