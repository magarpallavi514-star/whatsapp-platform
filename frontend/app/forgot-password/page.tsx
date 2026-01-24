'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /forgot-password to /auth/login
 * (Forgot password typically handled in login page in our setup)
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/auth/login');
  }, [router]);
  
  return null;
}
