// models klasöründeki Business modelini içeri aktarıyoruz
const Business = require('../models/Business');

/**
 * İŞLETME EKLEME
 * Sarp Gıda gibi işletmelerin sisteme ilk kaydını yapar.
 */
exports.addBusiness = async (req, res) => {
  try {
    const { businessName, industry, taxNumber, address, description, ownerId } = req.body;
    
    // Zorunlu alan kontrolü
    if (!ownerId || !businessName || !industry || !address) {
      return res.status(400).json({ 
        success: false, 
        message: "Lütfen işletme adı, sektör ve adres bilgilerini eksiksiz giriniz." 
      });
    }

    const newBusiness = new Business({
      owner: ownerId,
      businessName,
      industry,
      taxNumber,
      address,
      description
    });

    await newBusiness.save();
    
    // Kayıt başarılıysa tüm işletme verisini geri döndür
    res.status(201).json({ 
      success: true, 
      message: "İşletme başarıyla kaydedildi.",
      data: newBusiness 
    });
  } catch (error) {
    console.error("İşletme Kayıt Hatası:", error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * İŞLETME BİLGİLERİNİ GETİRME
 * Giriş yapan işverene ait işletmeyi ve çalışılan işçileri getirir.
 */
exports.getBusinessProfile = async (req, res) => {
  try {
    // Sahibi (owner) üzerinden işletmeyi bul ve işçi detaylarını doldur (populate)
    const business = await Business.findOne({ owner: req.params.ownerId })
      .populate('hiredWorkers', 'name email rating'); // İşçilerin sadece bu bilgilerini getir

    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: "Henüz bir işletme profiliniz bulunmamaktadır." 
      });
    }
    
    res.json({ 
      success: true, 
      data: business 
    });
  } catch (error) {
    console.error("Profil Getirme Hatası:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};