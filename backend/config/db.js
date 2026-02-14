const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.6cj2rkn.mongodb.net/jobPortal?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = mongoose;
