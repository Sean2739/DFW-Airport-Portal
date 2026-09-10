// app/page.js (server component)
import { Suspense } from 'react';
import LoginPage from '@/components/LoginWrapper';

export const metadata = {
  title: "Janta Power ⋅ Login",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );

}
    