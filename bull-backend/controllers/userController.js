// models klasöründeki User modelini içeri aktarıyoruz
// ÖNEMLİ: Dosya yolunun ve büyük/küçük harf duyarlılığının doğruluğundan emin ol (User.js)
const User = require("../models/User");

// Kayıt olma fonksiyonu
exports.register = async (req, res) => {
  try {
    // Frontend'den gelen veriyi terminalde görelim (Hata ayıklamak için çok önemli)
    console.log("Backend'e Gelen Veri:", req.body);

    const { name, email, password, role, birthDate, city, region } = req.body;

    // 1. Boş alan kontrolü (Backend tarafında güvenlik önlemi)
    if (!name || !email || !password || !birthDate) {
      return res.status(400).json({
        message: "Eksik veri: İsim, e-posta, şifre ve doğum tarihi zorunludur.",
      });
    }

    // 2. E-posta zaten var mı kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Bu e-posta adresi zaten kayıtlı." });
    }

    // 3. Yeni kullanıcıyı oluşturuyoruz
    const newUser = new User({
      name,
      email: email.toLowerCase(), // E-postayı küçük harfe çevirerek kaydetmek standarttır
      password, // İleride bcrypt.hash(password, 10) ile şifreleyebilirsin
      role: role || "worker", // Eğer rol gelmezse varsayılan olarak worker ata
      birthDate,
      city,
      region,
    });

    // 4. Veritabanına kaydediyoruz
    await newUser.save();

    console.log("Kullanıcı başarıyla kaydedildi:", newUser.email);

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    // Hata detayını terminalde detaylıca görelim
    console.error("MongoDB Kayıt Hatası Detayı:", error);

    res.status(500).json({
      message: "Sunucu hatası oluştu: " + error.message,
    });
  }
};

// Profil güncelleme fonksiyonu
exports.updateProfile = async (req, res) => {
  try {
    const { userId, name, email, birthDate } = req.body;
    console.log("Profil Güncelleme İsteği:", req.body);

    if (!userId) {
      return res.status(400).json({ message: "Kullanıcı ID gerekli." });
    }

    // Güncellenecek alanları hazırla
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.toLowerCase();
    if (birthDate) updateFields.birthDate = birthDate;

    // E-posta değişiyorsa, başka bir kullanıcıda zaten var mı kontrol et
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Bu e-posta adresi başka bir hesapta kayıtlı." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Şifreyi silip döndür
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    console.log("Profil güncellendi:", userResponse.email);
    res.json({ message: "Profil başarıyla güncellendi.", user: userResponse });
  } catch (error) {
    console.error("Profil Güncelleme Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu: " + error.message });
  }
};

// Şifre değiştirme fonksiyonu
exports.changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    console.log("Şifre Değiştirme İsteği:", userId);

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Tüm alanlar zorunludur." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Mevcut şifre kontrolü
    if (user.password !== currentPassword) {
      return res.status(401).json({ message: "Mevcut şifre hatalı!" });
    }

    user.password = newPassword;
    await user.save();

    console.log("Şifre güncellendi:", user.email);
    res.json({ message: "Şifreniz başarıyla güncellendi." });
  } catch (error) {
    console.error("Şifre Değiştirme Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu: " + error.message });
  }
};

// Konum güncelleme fonksiyonu
exports.updateLocation = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ message: "Kullanıcı ID ve konum bilgisi gerekli." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { latitude, longitude, locationUpdatedAt: new Date() } },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({ message: "Konum güncellendi.", user: userResponse });
  } catch (error) {
    console.error("Konum Güncelleme Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu: " + error.message });
  }
};

// Yakındaki işçileri getir (İşverenler için)
exports.getNearbyWorkers = async (req, res) => {
  try {
    // Konumu olan işçileri getir (son 24 saatte güncellemiş olanlar)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const workers = await User.find({
      role: "worker",
      latitude: { $ne: null },
      longitude: { $ne: null },
      locationUpdatedAt: { $gte: oneDayAgo },
    }).select("-password");

    res.json(workers);
  } catch (error) {
    console.error("Yakın İşçi Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası oluştu: " + error.message });
  }
};
