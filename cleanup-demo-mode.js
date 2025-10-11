/**
 * Demo Mode Cleanup Script
 * 
 * This script removes all demo mode traces from localStorage
 * Run this in the browser console after updating the application
 */

(() => {
  console.log('🧹 Demo Mode Cleanup Starting...');
  
  // Remove demo mode flag
  if (localStorage.getItem('demoMode')) {
    localStorage.removeItem('demoMode');
    console.log('✅ Removed demoMode from localStorage');
  }
  
  // Remove demo tokens
  const token = localStorage.getItem('token');
  if (token && token.startsWith('demo-mode-token-')) {
    localStorage.removeItem('token');
    console.log('✅ Removed demo token from localStorage');
  }
  
  // List remaining localStorage items
  console.log('📊 Remaining localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value?.substring(0, 50)}...`);
  }
  
  console.log('✅ Demo mode cleanup complete!');
  console.log('🔄 Reloading page to apply changes...');
  
  // Reload the page
  setTimeout(() => {
    location.reload();
  }, 1000);
})();