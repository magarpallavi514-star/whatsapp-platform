import dotenv from 'dotenv';
dotenv.config();

const rawToken = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔍 CRITICAL TOKEN ANALYSIS');
console.log('='.repeat(60));
console.log(`LENGTH: ${rawToken.length} chars`);
console.log(`FIRST 12: ${rawToken.slice(0, 12)}`);
console.log(`LAST 12: ${rawToken.slice(-12)}`);
console.log(`STARTS WITH: ${rawToken.startsWith('EA') ? '✅ EA (correct)' : '❌ NOT EA'}`);
console.log(`ENDS WITH: "${rawToken.slice(-1)}" (should be letter/number, not = or weird)`);
console.log(`HAS NEWLINE: ${rawToken.includes('\n') ? '❌ YES - CORRUPTED' : '✅ NO'}`);
console.log(`HAS SPACES: ${rawToken.includes(' ') ? '❌ YES - CORRUPTED' : '✅ NO'}`);
console.log(`HAS QUOTES: ${rawToken.includes('"') || rawToken.includes("'") ? '❌ YES - CORRUPTED' : '✅ NO'}`);

// Now trim and check
const trimmedToken = rawToken.trim();
console.log(`\nAfter trim() - Length: ${trimmedToken.length}`);
console.log(`Same as original: ${trimmedToken === rawToken ? '✅ YES' : '❌ DIFFERENT!'}`);

if (trimmedToken.length < 100) {
  console.log('\n⚠️  WARNING: Token is TOO SHORT (< 100 chars)');
}
if (trimmedToken.length > 260) {
  console.log('\n⚠️  WARNING: Token is TOO LONG (> 260 chars)');
}

console.log('='.repeat(60));
