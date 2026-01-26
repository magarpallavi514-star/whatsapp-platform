import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({}, { collection: 'conversations', strict: false });
const Conversation = mongoose.model('Conversation', conversationSchema);

mongoose.connect('mongodb://localhost:27017/pixelswhatsapp')
  .then(async () => {
    const conversations = await Conversation.find({ userPhone: '918087131777' }).lean();
    
    console.log('\n=== CONVERSATION IDS FOR ENROMATICS ===\n');
    if (conversations.length > 0) {
      conversations.forEach((conv, i) => {
        console.log(`${i+1}. _id: ${conv._id}`);
        console.log(`   conversationId field: ${conv.conversationId}`);
      });
    }
    process.exit(0);
  });
