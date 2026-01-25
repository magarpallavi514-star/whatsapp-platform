/**
 * 🔍 CHATBOT ACCESS DIAGNOSTIC
 * Check why Enromatics can't access chatbot
 * Diagnose role permissions and access control
 */

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pixels-whatsapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkChatbotAccess() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          🔍 CHATBOT ACCESS DIAGNOSTIC FOR ENROMATICS 🔍           ║
║                Checking roles and permissions                     ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  try {
    // Get User schema
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);
    
    // Find Enromatics user
    const enromUser = await User.findOne({ email: 'info@enromatics.com' }).lean();
    
    if (!enromUser) {
      console.log('❌ Enromatics user NOT FOUND');
      console.log('\nChecking all users:');
      const allUsers = await User.find({}).select('email role -_id').limit(5).lean();
      console.log(allUsers);
      mongoose.connection.close();
      return;
    }

    console.log(`\n✅ FOUND ENROMATICS USER\n`);
    console.log(`Email: ${enromUser.email}`);
    console.log(`Role: ${enromUser.role}`);
    console.log(`Status: ${enromUser.status}`);
    console.log(`Account ID: ${enromUser.accountId}`);
    console.log(`Plan: ${enromUser.plan}`);

    // Check role enum
    console.log(`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Valid Roles (from User schema):
  - superadmin: Full access
  - admin: Account admin access
  - manager: Team management
  - agent: Agent/support staff
  - user: Limited user access

Enromatics Role: ${enromUser.role}
    `);

    // Check role permissions
    const rolePermissions = {
      superadmin: ['chatbot', 'broadcast', 'templates', 'campaigns', 'contacts', 'analytics'],
      admin: ['chatbot', 'broadcast', 'templates', 'campaigns', 'contacts', 'analytics'],
      manager: ['chatbot', 'broadcast', 'templates', 'campaigns', 'contacts'],
      agent: ['contacts', 'messages'],
      user: ['messages']
    };

    const currentRole = enromUser.role;
    const permissions = rolePermissions[currentRole] || [];

    console.log(`\nChatbot Access: ${permissions.includes('chatbot') ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    console.log(`Role Permissions: ${permissions.join(', ')}`);

    if (!permissions.includes('chatbot')) {
      console.log(`
⚠️  ISSUE FOUND: User role "${currentRole}" does NOT have chatbot permission
    
    Fix: Update user role to one of: superadmin, admin, manager
      
    Command (if needed):
      db.users.updateOne(
        { email: "info@enromatics.com" },
        { $set: { role: "admin" } }
      )
    `);
    }

    // Check if account exists and is active
    const accountSchema = new mongoose.Schema({}, { strict: false });
    const Account = mongoose.model('Account', accountSchema);
    
    const account = await Account.findById(enromUser.accountId).lean();
    
    if (!account) {
      console.log(`\n❌ Account NOT FOUND: ${enromUser.accountId}`);
    } else {
      console.log(`
\n✅ Account Found: ${account.accountId || enromUser.accountId}
   Company: ${account.companyName}
   Status: ${account.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    }

    // Check chatbot/keyword rules for this account
    const keywordSchema = new mongoose.Schema({}, { strict: false });
    const KeywordRule = mongoose.model('KeywordRule', keywordSchema);
    
    const botCount = await KeywordRule.countDocuments({ accountId: enromUser.accountId });
    
    console.log(`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHATBOT RULES DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keyword Rules: ${botCount}
    `);

    if (botCount > 0) {
      const bots = await KeywordRule.find({ accountId: enromUser.accountId }).select('name isActive phoneNumberId -_id').limit(5).lean();
      bots.forEach((bot, idx) => {
        console.log(`  ${idx + 1}. ${bot.name} (${bot.isActive ? 'active' : 'inactive'}) - Phone: ${bot.phoneNumberId}`);
      });
    }

    // SUMMARY
    console.log(`

╔════════════════════════════════════════════════════════════════════╗
║                    DIAGNOSTIC SUMMARY 📋                          ║
╚════════════════════════════════════════════════════════════════════╝

User Status:        ${enromUser.email ? '✅ Found' : '❌ Not Found'}
Role:               ${enromUser.role}
Chatbot Access:     ${permissions.includes('chatbot') ? '✅ ALLOWED' : '❌ BLOCKED'}
Account Active:     ${account?.isActive ? '✅ Yes' : '❌ No'}
Chatbot Rules:      ${botCount} rules
    `);

    if (permissions.includes('chatbot') && botCount === 0) {
      console.log(`
ℹ️  NOTE: User has permission but no chatbot rules exist.
    This is normal for a new account. Create a chatbot rule to test.
    `);
    }

    if (!permissions.includes('chatbot')) {
      console.log(`
🔧 ACTION REQUIRED:
    Update user role to enable chatbot access
    
    Option 1: Via MongoDB
      db.users.updateOne(
        { email: "info@enromatics.com" },
        { $set: { role: "admin" } }
      )
    
    Option 2: Via Settings in UI
      Settings → Team → Enromatics User → Change Role to Admin
    `);
    }

    mongoose.connection.close();

  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

checkChatbotAccess();
