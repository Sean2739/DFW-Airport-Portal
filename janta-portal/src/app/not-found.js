import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
