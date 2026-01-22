import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function search() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Searching all collections for "enromatics"...\n');
    
    for (const col of collections) {
      const collectionName = col.name;
      const collection = db.collection(collectionName);
      
      // Search for enromatics in common fields
      const result = await collection.findOne({
        $or: [
          { name: { $regex: 'enromatics', $options: 'i' } },
          { email: { $regex: 'enromatics', $options: 'i' } },
          { email: 'info@enromatics.com' }
        ]
      });
      
      if (result) {
        console.log(`✅ Found in collection: ${collectionName}`);
        console.log(JSON.stringify(result, null, 2));
        console.log('\n');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

search();
