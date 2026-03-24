// src/config/api.js
// ═══════════════════════════════════════════════════════════════
// TÜM API ADRESLERİ BU DOSYADAN YÖNETİLİR
// ═══════════════════════════════════════════════════════════════
//
// 🏠 YEREL AĞDA ÇALIŞIRKEN (aynı Wi-Fi):
//    Aşağıdaki IP'yi kendi bilgisayarınızın lokal IP'siyle değiştirin.
//    Örn: "http://192.168.1.5:5000/api"
//
// 🌐 FARKLI KONUMDAN BAĞLANIRKEN (tunnel ile):
//    1) Backend klasöründe terminale:  npx localtunnel --port 5000
//    2) Verilen URL'yi buraya yapıştırın (sonuna /api ekleyin).
//    Örn: "https://warm-lions-fly.loca.lt/api"
//
// ⚠️  SADECE BU DOSYAYI DEĞİŞTİRMENİZ YETERLİDİR.
// ═══════════════════════════════════════════════════════════════

import axios from "axios";

const API_BASE = "https://full-pans-invite.loca.lt/api";

// ─── Localtunnel Bypass ───────────────────────────────────────
// Localtunnel her isteğe bir "Click to Continue" sayfası gösterir.
// Bu header sayesinde o sayfa atlanır ve API istekleri doğrudan geçer.
// Yerel ağda çalışırken bu header'ın hiçbir zararı yoktur.
// ──────────────────────────────────────────────────────────────
axios.defaults.headers.common["bypass-tunnel-reminder"] = "true";

export default API_BASE;
