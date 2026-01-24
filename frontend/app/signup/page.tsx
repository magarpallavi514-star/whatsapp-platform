'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /signup to /auth/register
 */
export default function SignupPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/auth/register');
  }, [router]);
  
  return null;
}
