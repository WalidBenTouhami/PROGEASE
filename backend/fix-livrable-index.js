// backend/fix-livrable-index.js
// Usage: node fix-livrable-index.js
// Drops the old unique index on {projetId, nom} and creates a new unique index on {projetId, intitule} for the livrables collection.

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progease';

async function fixLivrableIndex() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;
  const collection = db.collection('livrables');

  // Drop old index if it exists
  try {
    await collection.dropIndex('projetId_1_nom_1');
    console.log('Dropped old index: projetId_1_nom_1');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Old index projetId_1_nom_1 not found, skipping drop.');
    } else {
      console.error('Error dropping old index:', err);
    }
  }

  // Create new index
  try {
    await collection.createIndex({ projetId: 1, intitule: 1 }, { unique: true });
    console.log('Created new unique index: { projetId: 1, intitule: 1 }');
  } catch (err) {
    console.error('Error creating new index:', err);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

fixLivrableIndex().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
}); 