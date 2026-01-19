/**
 * Force logout and cleanup
 * Add this to your browser console to clear all auth data
 */

(function() {
  console.log('🔄 Clearing all authentication data...');
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage  
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  console.log('✅ All auth data cleared');
  console.log('🔀 Redirecting to login page...');
  
  // Wait 1 second then redirect
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
})();
