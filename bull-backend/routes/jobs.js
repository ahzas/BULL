// routes/jobs.js
const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// İLAN EKLEME (POST)
router.post("/", async (req, res) => {
  console.log("Backend'e Gelen Veri:", req.body);

  const newJob = new Job({
    title: req.body.title,
    company: req.body.company,
    image: req.body.image,
    category: req.body.category,
    subCategory: req.body.subCategory,
    serviceType: req.body.serviceType || "Bull-Part",
    price: req.body.price,
    location: req.body.location,
    fromLocation: req.body.fromLocation,
    toLocation: req.body.toLocation,
    fromDistrict: req.body.fromDistrict,
    toDistrict: req.body.toDistrict,
    tonnage: req.body.tonnage,
    productType: req.body.productType,
    vehicleType: req.body.vehicleType,
    loadingDate: req.body.loadingDate,
    description: req.body.description,
    ownerRole: req.body.ownerRole,
    type: req.body.type,
    // KİMLİK ve DURUM
    ownerId: req.body.ownerId, // İlanı oluşturan kişinin ID'si
    status: "active", // Varsayılan durum
    // KONUM KOORDİNATLARI
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// TÜM İLANLARI GETİRME (GET)
router.get("/", async (req, res) => {
  try {
    // Sadece aktif ilanları getir
    const jobs = await Job.find({ status: "active" }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// KULLANICININ KENDİ İLANLARI (AKTİF VE GEÇMİŞ) - İşlerim Ekranı İçin
router.get("/my-jobs/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Aktif ilanlar
    const activeJobs = await Job.find({
      ownerId: userId,
      status: "active",
    }).sort({ createdAt: -1 });

    // Geçmiş (tamamlanmış) ilanlar - assignedTo bilgisini populate ediyoruz
    const pastJobs = await Job.find({
      $or: [{ ownerId: userId }, { assignedTo: userId }],
      status: "completed",
    })
      .populate("assignedTo", "name rating ratingCount")
      .populate("ownerId", "name company rating ratingCount")
      .sort({ completedAt: -1 });

    res.json({
      activeJobs,
      pastJobs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// İŞİ TAMAMLA (GEÇMİŞE TAŞI)
router.put("/:jobId/complete", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { workerId } = req.body; // İşi tamamlayan işçinin ID'si (varsa)

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        status: "completed",
        completedAt: new Date(),
        assignedTo: workerId || null,
      },
      { new: true },
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }

    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// İŞVERENİN AKTİF ÇALIŞANLARI (in_progress olan işler + işçi detayları)
router.get("/active-workers/:employerId", async (req, res) => {
  try {
    const { employerId } = req.params;

    const activeJobs = await Job.find({
      ownerId: employerId,
      status: "in_progress",
      assignedTo: { $ne: null },
    })
      .populate("assignedTo", "name email birthDate city region rating ratingCount phone")
      .sort({ createdAt: -1 });

    // İşçi bilgileri + iş bilgilerini birleştir
    const workers = activeJobs.map((job) => ({
      jobId: job._id,
      jobTitle: job.title,
      jobPrice: job.price,
      jobLocation: job.location,
      jobCategory: job.category,
      jobCreatedAt: job.createdAt,
      worker: job.assignedTo,
    }));

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// İŞÇİNİN İLANA BAŞVURMASI
router.post("/:jobId/apply", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "İlan bulunamadı" });

    // Daha önce başvurmuş mu?
    if (job.applicants.includes(userId)) {
      return res.status(400).json({ message: "Zaten başvurdunuz" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $push: { applicants: userId } },
      { new: true }
    );

    res.json({ message: "Başvuru başarılı", job: updatedJob });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// İŞVERENİN İŞÇİYİ İŞE ALMASI (ONAYLAMASI)
router.put("/:jobId/hire", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { workerId } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        assignedTo: workerId,
        status: "in_progress",
      },
      { new: true },
    );

    res.json({ message: "İşçi onaylandı, iş başlatıldı.", job: updatedJob });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// İŞİN BİTİMİNDE KARŞILIKLI ONAY
router.put("/:jobId/approve-completion", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { role } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "İlan bulunamadı" });

    const updateFields = {};
    if (role === "worker") updateFields.workerApproved = true;
    if (role === "employer") updateFields.employerApproved = true;

    const isWorkerApproved = role === "worker" || job.workerApproved;
    const isEmployerApproved = role === "employer" || job.employerApproved;

    // Her ikisi de onayladıysa tamamen bitir
    if (isWorkerApproved && isEmployerApproved) {
      updateFields.status = "completed";
      updateFields.completedAt = new Date();
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateFields },
      { new: true }
    );
    res.json({ message: "Onay işlemi başarılı", job: updatedJob });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ONAY BEKLEYEN İŞLERİ (SEKMESİNİ) GETİRME
router.get("/approvals/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;

    let pendingHires = [];
    let pendingCompletions = [];

    if (role === "employer") {
      // 1- İşverenin başvuru alan ama henüz kimi seçeceğini belirlemediği ilanları
      pendingHires = await Job.find({
        ownerId: userId,
        status: "active",
        "applicants.0": { $exists: true }, // En az 1 başvuran var
      }).populate("applicants", "name rating");

      // 2- İşverenin işi verdiği (in_progress) ve karşılıklı onay bekleyen işleri
      pendingCompletions = await Job.find({
        ownerId: userId,
        status: "in_progress",
      }).populate("assignedTo", "name rating");
    } else {
      // İşçi tarafı
      // 1- Başvurduğu ama henüz onaylanmamış (işe alınmamış) ilanlar
      pendingHires = await Job.find({
        applicants: userId,
        status: "active",
        assignedTo: { $exists: false },
      }).populate("ownerId", "name company");

      // 2- İşe alındığı ve devam eden işler (in_progress)
      pendingCompletions = await Job.find({
        assignedTo: userId,
        status: "in_progress",
      }).populate("ownerId", "name company");
    }

    res.json({
      pendingHires,
      pendingCompletions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// KULLANICIYI DEĞERLENDİRME (PUANLAMA)
router.post("/:jobId/rate", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { targetUserId, ratingValue, role } = req.body;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Geçersiz puan değeri" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "İlan bulunamadı" });
    if (job.status !== "completed") return res.status(400).json({ message: "İş henüz tamamlanmamış" });

    if (role === "worker" && job.workerRated) return res.status(400).json({ message: "İşveren için zaten oy kullandınız" });
    if (role === "employer" && job.employerRated) return res.status(400).json({ message: "İşçi için zaten oy kullandınız" });

    const targetUser = await require("../models/User").findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "Oylanacak kullanıcı bulunamadı" });

    const currentRating = targetUser.rating || 5.0;
    const currentCount = targetUser.ratingCount || 0;
    const newCount = currentCount + 1;
    
    let newRating;
    if (currentCount === 0) {
        newRating = ratingValue;
    } else {
        newRating = ((currentRating * currentCount) + ratingValue) / newCount;
    }

    targetUser.rating = parseFloat(newRating.toFixed(1));
    targetUser.ratingCount = newCount;
    await targetUser.save();

    const jobUpdateFields = {};
    if (role === "worker") jobUpdateFields.workerRated = true;
    if (role === "employer") jobUpdateFields.employerRated = true;

    await Job.findByIdAndUpdate(jobId, { $set: jobUpdateFields });

    res.json({ message: "Değerlendirme başarıyla kaydedildi!", newRating: targetUser.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
