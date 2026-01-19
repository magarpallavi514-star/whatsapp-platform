// Clear localStorage and redirect to login
// Run this in browser console if you get 401/404 errors after updates

if (typeof window !== 'undefined') {
  console.log('🔄 Clearing localStorage...');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  console.log('✅ localStorage cleared');
  console.log('🔀 Redirecting to login...');
  window.location.href = '/login';
}
