import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KeywordRule from './src/models/KeywordRule.js';

dotenv.config();

async function restoreChatbot() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const accountId = '2600003';
    
    console.log('🤖 RESTORING ENROMATICS CHATBOT\n');

    // Create common chatbot rules for Enromatics
    const rules = [
      {
        accountId,
        name: 'Demo Booking',
        description: 'Auto-reply when customer asks for demo',
        keywords: ['demo', 'demo booking', 'schedule', 'meeting', 'call'],
        matchType: 'contains',
        replyType: 'text',
        replyContent: {
          text: 'Thanks for your interest! 🎉\n\nWould you like to schedule a demo of our platform?\n\nReply with:\n✅ Yes - to book a demo\n❌ No - if not interested\n\nOur team will reach out within 2 hours!'
        },
        isActive: true
      },
      {
        accountId,
        name: 'Pricing Information',
        description: 'Auto-reply with pricing details',
        keywords: ['price', 'pricing', 'cost', 'charges', 'plan'],
        matchType: 'contains',
        replyType: 'text',
        replyContent: {
          text: '💰 Our Plans:\n\n📦 **Starter** - ₹2,499/month\n- Upto 10 conversations\n- Basic templates\n- Email support\n\n📦 **Professional** - ₹5,999/month\n- Upto 100 conversations\n- Advanced features\n- Priority support\n\n📦 **Enterprise** - Custom\n- Unlimited conversations\n- Custom integrations\n- Dedicated support\n\nWant to know more? Reply "demo" 😊'
        },
        isActive: true
      },
      {
        accountId,
        name: 'Greeting',
        description: 'Friendly greeting when customer says hello',
        keywords: ['hi', 'hello', 'hey', 'hola', 'namaste'],
        matchType: 'contains',
        replyType: 'text',
        replyContent: {
          text: 'Hello! 👋 Welcome to Enromatics!\n\nWe help educational institutions manage WhatsApp communication efficiently.\n\nHow can we help you today?\n- 📚 Know about our features\n- 💰 Check our pricing\n- 📞 Schedule a demo'
        },
        isActive: true
      }
    ];

    let created = 0;
    for (const rule of rules) {
      const existing = await KeywordRule.findOne({
        accountId: rule.accountId,
        name: rule.name
      });

      if (!existing) {
        const newRule = new KeywordRule(rule);
        await newRule.save();
        created++;
        console.log(`✅ Created: "${rule.name}"`);
        console.log(`   Keywords: ${rule.keywords.join(', ')}`);
        console.log(`   Response: "${rule.replyContent.text.substring(0, 50)}..."\n`);
      } else {
        console.log(`⏭️  Skipped: "${rule.name}" (already exists)\n`);
      }
    }

    console.log('='.repeat(50));
    console.log(`\n📊 CHATBOT RESTORED\n`);
    console.log(`✅ Created ${created} keyword rules for Enromatics`);
    console.log(`✅ Rules are ACTIVE and ready to use`);
    console.log(`✅ Chatbot will auto-reply to trigger keywords\n`);
    
    console.log('Testing rules:');
    console.log('  When customer says "hi" → Friendly greeting');
    console.log('  When customer says "demo" → Demo booking');
    console.log('  When customer says "price" → Pricing info\n');
    
    console.log('Dashboard Location:');
    console.log('  Settings > Chatbot > Keyword Rules\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restoreChatbot();
