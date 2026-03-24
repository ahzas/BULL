const User = require('../models/User');
const calculateAge = require('../utils/ageCalculator');

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) { // Not: Gerçek projede bcrypt kullanmalısın!
      return res.status(401).json({ message: "E-posta veya şifre hatalı" });
    }

    // Yaşı hesapla
    const userAge = calculateAge(user.birthDate);

    // Frontend'in beklediği firstName ve lastName ayrımını yapalım
    const nameParts = user.name.split(' ');
    const firstName = nameParts.slice(0, -1).join(' ');
    const lastName = nameParts.slice(-1).join(' ');

    res.status(200).json({
      _id: user._id,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      role: user.role,
      age: userAge, // Frontend artık bu yaş bilgisini profilescreen.js'de kullanacak
      streak: 12, // Statik veya DB'den gelen oyunlaştırma verileri
      bullPoints: 850,
      commissionTier: "%5"
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};