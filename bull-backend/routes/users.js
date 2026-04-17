const express = require("express");
const router = express.Router();
const User = require("../models/User");
const userController = require("../controllers/userController");

/**
 * @route   POST api/users/login
 * @desc    Kullanıcı Girişi
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı!" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Giriş başarılı!",
      user: userResponse,
    });
  } catch (err) {
    console.error("Login Hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

/**
 * @route   POST api/users/register
 * @desc    Kullanıcı Kaydı
 */
router.post("/register", userController.register);

/**
 * @route   PUT api/users/update
 * @desc    Kullanıcı Profil Güncelleme
 */
router.put("/update", userController.updateProfile);

/**
 * @route   PUT api/users/change-password
 * @desc    Şifre Değiştirme
 */
router.put("/change-password", userController.changePassword);

/**
 * @route   PUT api/users/update-location
 * @desc    Konum Güncelleme
 */
router.put("/update-location", userController.updateLocation);

/**
 * @route   GET api/users/nearby-workers
 * @desc    Yakındaki İşçileri Getir (İşverenler için)
 */
  router.get("/nearby-workers", userController.getNearbyWorkers);
  
  /**
   * @route   GET api/users/:id
   * @desc    Kullanıcı Profili Getir
   */
  router.get("/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  module.exports = router;
