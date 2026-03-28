const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["worker", "employer"], required: true },
  birthDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  bullPoints: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  ratingCount: { type: Number, default: 0 },
  // KONUM BİLGİLERİ (İl / İlçe)
  city: { type: String },
  region: { type: String },
  
  // KONUM KOORDİNATLARI
  latitude: { type: Number },
  longitude: { type: Number },
  locationUpdatedAt: { type: Date },
});

module.exports = mongoose.model("User", UserSchema);
