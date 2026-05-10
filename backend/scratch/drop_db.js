const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://admin:password@localhost:27017/smart-parking?authSource=admin';

async function drop() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

drop();
