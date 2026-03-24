const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// MODELLER VE ROTALARIN İÇERİ ALINMASI
const userRoutes = require('./routes/users'); 
const jobRoutes = require('./routes/jobs'); 
const businessRoutes = require('./routes/business');

const app = express();

// --- GÜVENLİK VE AYARLAR ---
app.use(cors()); // Farklı cihazlardan (telefon/tablet) gelen istekleri kabul eder
app.use(express.json()); // JSON formatındaki verileri okumamızı sağlar

// --- DEBUG LOGGER (HATA AYIKLAMA İÇİN EKLE) ---
// Bu kod, gelen her isteği terminalde "POST /api/users/login" şeklinde yazdırır.
// Eğer butona bastığında terminalde hiçbir şey yazmıyorsa, istek sunucuya ulaşmıyor demektir.
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// VERİTABANI BAĞLANTISI
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ BULL Veritabanına Bağlandı!"))
  .catch(err => console.log("❌ DB Hatası:", err));

// API ROTALARININ TANIMLANMASI
app.use('/api/users', userRoutes); 
app.use('/api/jobs', jobRoutes); 
app.use('/api/business', businessRoutes);

// ANA DİZİN KONTROLÜ (Sunucu açık mı testi için)
app.get('/', (req, res) => {
  res.send('BULL API Sunucusu Aktif!');
});

const PORT = process.env.PORT || 5000;

// ÖNEMLİ: '0.0.0.0' ekleyerek ağdaki tüm cihazların erişimine izin veriyoruz
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sunucu ${PORT} portunda Vezir için tıkır tıkır çalışıyor.`);
});