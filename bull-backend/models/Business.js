const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // İşletme sahibi (İşveren)
  businessName: { type: String, required: true },
  industry: { type: String, required: true }, // Örn: Gıda, Lojistik
  taxNumber: { type: String },
  address: { type: String, required: true },
  description: { type: String },
  hiredWorkers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // Daha önce temin edilen işçiler
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);