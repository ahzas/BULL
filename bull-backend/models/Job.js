// bull-backend/models/Job.js
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  image: { type: String },
  category: { type: String },
  subCategory: { type: String },
  price: { type: String },
  location: { type: String },
  description: { type: String },
  rating: { type: Number, default: 5.0 },
  createdAt: { type: Date, default: Date.now },
  ownerRole: { type: String, enum: ["worker", "employer"], required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }, // Şimdilik geriye dönük uyumluluk için false
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Başvuran işçiler
  status: {
    type: String,
    enum: ["active", "in_progress", "completed", "cancelled"],
    default: "active",
  },
  workerApproved: { type: Boolean, default: false }, // İşçinin işi tamamlama onayı
  employerApproved: { type: Boolean, default: false }, // İşverenin işi tamamlama onayı
  completedAt: { type: Date },
  type: { type: String, enum: ["job_offer", "skill_profile"], required: true },
  // KONUM KOORDİNATLARI
  latitude: { type: Number },
  longitude: { type: Number },
});

module.exports = mongoose.model("Job", JobSchema);
