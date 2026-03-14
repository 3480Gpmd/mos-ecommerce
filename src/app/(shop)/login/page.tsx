import { Suspense } from 'react';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse w-full max-w-md space-y-4"><div className="h-8 bg-gray-100 rounded w-1/3 mx-auto" /><div className="h-12 bg-gray-100 rounded" /><div className="h-12 bg-gray-100 rounded" /></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
