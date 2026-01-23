import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Contact from './src/models/Contact.js';

dotenv.config();

async function checkContacts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n📋 CONTACT PERSISTENCE CHECK\n');
    
    // Check Enromatics contacts
    const enromaticsContacts = await Contact.find({
      accountId: '6971e3a706837a5539992bee'
    }).sort({ createdAt: -1 });
    
    console.log('ENROMATICS ACCOUNT CONTACTS:');
    console.log(`Total contacts: ${enromaticsContacts.length}\n`);
    
    if (enromaticsContacts.length > 0) {
      enromaticsContacts.forEach((contact, i) => {
        console.log(`Contact ${i + 1}:`);
        console.log(`  Name: ${contact.name}`);
        console.log(`  Phone: ${contact.whatsappNumber}`);
        console.log(`  Type: ${contact.type}`);
        console.log(`  Opted In: ${contact.isOptedIn}`);
        console.log(`  Messages: ${contact.messageCount || 0}`);
        console.log(`  Last Message: ${contact.lastMessageAt}`);
        console.log(`  Created: ${contact.createdAt}`);
        console.log(`  Updated: ${contact.updatedAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No contacts found\n');
    }
    
    // Check Superadmin contacts
    const superadminContacts = await Contact.find({
      accountId: '695a15a5c526dbe7c085ece2'
    }).sort({ createdAt: -1 });
    
    console.log('SUPERADMIN ACCOUNT CONTACTS:');
    console.log(`Total contacts: ${superadminContacts.length}\n`);
    
    if (superadminContacts.length > 0) {
      superadminContacts.slice(0, 3).forEach((contact, i) => {
        console.log(`Contact ${i + 1}:`);
        console.log(`  Name: ${contact.name}`);
        console.log(`  Phone: ${contact.whatsappNumber}`);
        console.log(`  Messages: ${contact.messageCount || 0}`);
        console.log('');
      });
      if (superadminContacts.length > 3) {
        console.log(`... and ${superadminContacts.length - 3} more contacts`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkContacts();
