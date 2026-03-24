import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { JobContext } from "../../context/JobContext";
import {
  calculateEmployerPreview,
  calculateWorkerPreview,
  getCommissionTier,
} from "../../utils/commission";
import API_BASE from "../../config/api";

// --- ROL YÖNETİMİ ---

const CATEGORY_ICONS = {
  "Bilişim ve Teknoloji (IT)": "code-working-outline",
  "Satış ve Pazarlama": "trending-up-outline",
  "Üretim ve Endüstri": "settings-outline",
  "Lojistik ve Taşımacılık": "truck-outline",
  "Hizmet ve Turizm": "people-outline",
  "Yönetim ve İdari İşler": "briefcase-outline",
  Diğer: "ellipsis-horizontal-outline",
};

const CATEGORY_DATA = {
  "Bilişim ve Teknoloji (IT)": [
    "Yazılım Geliştirme",
    "Veri Bilimi",
    "Siber Güvenlik",
    "IT Destek",
    "Sistem Yönetimi",
  ],
  "Satış ve Pazarlama": [
    "Saha Satış",
    "Dijital Pazarlama",
    "CRM Yönetimi",
    "E-ticaret",
    "Marka Yönetimi",
  ],
  "Üretim ve Endüstri": [
    "Fabrika İşçisi",
    "Kalite Kontrol",
    "Depo Yönetimi",
    "Makine Operatörü",
    "Bakım",
  ],
  "Lojistik ve Taşımacılık": ["Kurye", "Şoför", "Tedarik Zinciri", "Sevkiyat"],
  "Hizmet ve Turizm": [
    "Restoran / Kafe",
    "Otel ve Konaklama",
    "Temizlik",
    "Güvenlik",
  ],
  "Yönetim ve İdari İşler": [
    "İnsan Kaynakları",
    "Muhasebe",
    "Sekreterya",
    "Hukuk",
  ],
  Diğer: ["Diğer"],
};

export default function PostJobScreen({ navigation }) {
  const { addJob } = useContext(JobContext);
  const { user, isEmployerMode } = useContext(AuthContext);
  const userData = user?.user || user;
  const USER_ROLE = isEmployerMode ? "employer" : userData?.role || "worker";
  const streakDays = userData?.streak || 0;

  const API_URL = `${API_BASE}/jobs`;

  const [form, setForm] = useState({
    title: "",
    company: "",
    price: "",
    location: "",
    description: "",
    category: "",
    subCategory: "",
  });

  const handlePublish = async () => {
    const { title, company, price, location, category, subCategory } = form;

    if (
      !title ||
      !company ||
      !price ||
      !location ||
      !category ||
      !subCategory
    ) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm zorunlu alanları doldurunuz.");
      return;
    }

    try {
      // Konum koordinatlarını al
      let coords = {};
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (locErr) {
        console.log("Konum alınamadı:", locErr.message);
      }

      const response = await axios.post(API_URL, {
        ...form,
        ...coords,
        image: CATEGORY_ICONS[category] || "briefcase-outline",
        rating: 5.0,
        ownerRole: USER_ROLE,
        ownerId: userData?._id || userData?.id,
        type: USER_ROLE === "worker" ? "skill_profile" : "job_offer",
      });

      if (response.status === 201) {
        addJob(response.data);
        Alert.alert(
          "Başarılı",
          USER_ROLE === "worker"
            ? "Profiliniz yayına alındı!"
            : "İlanınız yayına alındı!",
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Yayınlama hatası:", error);
      Alert.alert("Hata", "Sunucu bağlantısı kurulamadı.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {USER_ROLE === "worker"
            ? "Yeteneklerini Paylaş"
            : "Yeni İlan Oluştur"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {USER_ROLE === "worker" ? "Yetenek Başlığı" : "İş Başlığı"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                USER_ROLE === "worker"
                  ? "Örn: Profesyonel Garson"
                  : "Örn: Günlük Garson"
              }
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {USER_ROLE === "worker" ? "Ad Soyad" : "İşletme Adı"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                USER_ROLE === "worker" ? "Vezir ..." : "Sarp Gıda Ltd."
              }
              value={form.company}
              onChangeText={(t) => setForm({ ...form, company: t })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>
                {USER_ROLE === "worker" ? "Beklenen Ücret (₺)" : "Ücret (₺)"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="1500"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(t) => setForm({ ...form, price: t })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Konum</Text>
              <TextInput
                style={styles.input}
                placeholder="İlçe, İl"
                value={form.location}
                onChangeText={(t) => setForm({ ...form, location: t })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.badgeContainer}>
              {Object.keys(CATEGORY_DATA).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.badge,
                    form.category === cat && styles.activeBadge,
                  ]}
                  onPress={() =>
                    setForm({ ...form, category: cat, subCategory: "" })
                  }
                >
                  <Ionicons
                    name={CATEGORY_ICONS[cat]}
                    size={16}
                    color={form.category === cat ? "#FFF" : "#003366"}
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      form.category === cat && styles.activeBadgeText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {form.category !== "" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alt Kategori</Text>
              <View style={styles.badgeContainer}>
                {CATEGORY_DATA[form.category].map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    style={[
                      styles.badge,
                      form.subCategory === sub && styles.activeBadge,
                    ]}
                    onPress={() => setForm({ ...form, subCategory: sub })}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        form.subCategory === sub && styles.activeBadgeText,
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {USER_ROLE === "worker"
                ? "Deneyimlerin ve Yeteneklerin"
                : "İş Açıklaması"}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detaylar..."
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
            />
          </View>

          {/* ══════════════ KOMİSYON ÖNİZLEME ══════════════ */}
          {form.price ? (
            <View style={styles.commissionCard}>
              <View style={styles.commissionHeader}>
                <Ionicons name="calculator-outline" size={18} color="#003366" />
                <Text style={styles.commissionTitle}>Komisyon Detayı</Text>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>
                    {getCommissionTier(streakDays).label} • {streakDays} gün
                    seri
                  </Text>
                </View>
              </View>

              {USER_ROLE === "employer"
                ? // İŞVEREN: Toplam ödeyeceği tutarı göster
                  (() => {
                    const preview = calculateEmployerPreview(
                      form.price,
                      streakDays,
                    );
                    if (!preview) return null;
                    return (
                      <>
                        <View style={styles.commissionRow}>
                          <Text style={styles.commissionLabel}>
                            İlan Ücreti
                          </Text>
                          <Text style={styles.commissionValue}>
                            {preview.basePrice.toLocaleString("tr-TR")} ₺
                          </Text>
                        </View>
                        <View style={styles.commissionRow}>
                          <Text style={styles.commissionLabel}>
                            BULL Komisyonu (%{preview.ratePercent})
                          </Text>
                          <Text
                            style={[
                              styles.commissionValue,
                              { color: "#F59E0B" },
                            ]}
                          >
                            +{preview.commission.toLocaleString("tr-TR")} ₺
                          </Text>
                        </View>
                        <View style={styles.commissionDivider} />
                        <View style={styles.commissionRow}>
                          <Text style={styles.commissionTotalLabel}>
                            Toplam Ödeme
                          </Text>
                          <Text style={styles.commissionTotalValue}>
                            {preview.total.toLocaleString("tr-TR")} ₺
                          </Text>
                        </View>
                      </>
                    );
                  })()
                : // İŞÇİ: Net ele geçecek tutarı göster
                  (() => {
                    const preview = calculateWorkerPreview(
                      form.price,
                      streakDays,
                    );
                    if (!preview) return null;
                    return (
                      <>
                        <View style={styles.commissionRow}>
                          <Text style={styles.commissionLabel}>
                            Beklenen Ücret
                          </Text>
                          <Text style={styles.commissionValue}>
                            {preview.basePrice.toLocaleString("tr-TR")} ₺
                          </Text>
                        </View>
                        <View style={styles.commissionRow}>
                          <Text style={styles.commissionLabel}>
                            BULL Komisyonu (%{preview.ratePercent})
                          </Text>
                          <Text
                            style={[
                              styles.commissionValue,
                              { color: "#EF4444" },
                            ]}
                          >
                            -{preview.commission.toLocaleString("tr-TR")} ₺
                          </Text>
                        </View>
                        <View style={styles.commissionDivider} />
                        <View style={styles.commissionRow}>
                          <Text style={styles.commissionTotalLabel}>
                            Net Kazanç
                          </Text>
                          <Text
                            style={[
                              styles.commissionTotalValue,
                              { color: "#28A745" },
                            ]}
                          >
                            {preview.netPay.toLocaleString("tr-TR")} ₺
                          </Text>
                        </View>
                      </>
                    );
                  })()}
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.publishButton}
            onPress={handlePublish}
          >
            <Text style={styles.publishText}>
              {USER_ROLE === "worker" ? "PROFİLİ PAYLAŞ" : "İLAN YAYINLA"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  scrollContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#003366",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  badgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    gap: 6,
  },
  activeBadge: { backgroundColor: "#003366", borderColor: "#003366" },
  badgeText: { fontSize: 13, color: "#003366", fontWeight: "600" },
  activeBadgeText: { color: "#FFFFFF" },
  publishButton: {
    backgroundColor: "#28A745",
    height: 56,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  publishText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  // --- Komisyon Kartı ---
  commissionCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  commissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  commissionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#003366",
    flex: 1,
  },
  tierBadge: {
    backgroundColor: "#003366",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFF" },
  commissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  commissionLabel: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  commissionValue: { fontSize: 14, color: "#1E293B", fontWeight: "600" },
  commissionDivider: {
    height: 1,
    backgroundColor: "#DBEAFE",
    marginVertical: 8,
  },
  commissionTotalLabel: { fontSize: 15, color: "#003366", fontWeight: "800" },
  commissionTotalValue: { fontSize: 17, color: "#003366", fontWeight: "800" },
});
