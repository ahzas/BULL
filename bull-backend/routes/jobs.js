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
    price: req.body.price,
    location: req.body.location,
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
      ownerId: userId,
      status: "completed",
    })
      .populate("assignedTo", "name rating") // İşçi detaylarını getir
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

    job.applicants.push(userId);
    const updatedJob = await job.save();

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

    if (role === "worker") job.workerApproved = true;
    if (role === "employer") job.employerApproved = true;

    // Her ikisi de onayladıysa tamamen bitir
    if (job.workerApproved && job.employerApproved) {
      job.status = "completed";
      job.completedAt = new Date();
    }

    const updatedJob = await job.save();
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

module.exports = router;
