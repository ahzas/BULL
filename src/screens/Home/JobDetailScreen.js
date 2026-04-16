// src/screens/Home/JobDetailScreen.js
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useContext } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;
  const isTir = job.serviceType === "Bull-Tır";

  const handleApply = async () => {
    try {
      await axios.put(`${API_BASE}/jobs/${job._id}/apply`, { workerId: userId });
      Alert.alert("Başarılı", "Başvurunuz iletildi!");
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || "Bir hata oluştu.";
      Alert.alert("Hata", msg);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={16} color="#999" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlan Detayı</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BAŞLIK KARTI */}
        <View style={styles.titleCard}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCompany}>{job.company}</Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{job.price} ₺</Text>
          </View>
        </View>

        {/* DETAYLAR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İlan Bilgileri</Text>
          <View style={styles.sectionCard}>
            <InfoRow icon="location-outline" label="Konum" value={job.location || "Belirtilmemiş"} />
            <InfoRow icon="grid-outline" label="Kategori" value={job.category || "-"} />
            {job.subCategory ? <InfoRow icon="pricetag-outline" label="Alt Kategori" value={job.subCategory} /> : null}
            <InfoRow icon="star-outline" label="Puan" value={`${job.rating || "5.0"} ⭐`} />
            <InfoRow icon="briefcase-outline" label="Tür" value={isTir ? "Lojistik" : "Genel İş"} />
          </View>
        </View>

        {/* LOJİSTİK BİLGİSİ */}
        {isTir && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lojistik Detayları</Text>
            <View style={styles.sectionCard}>
              {job.fromLocation && <InfoRow icon="arrow-up-circle-outline" label="Yükleme" value={job.fromLocation} />}
              {job.toLocation && <InfoRow icon="arrow-down-circle-outline" label="Teslimat" value={job.toLocation} />}
              {job.tonnage && <InfoRow icon="barbell-outline" label="Tonaj" value={`${job.tonnage} Ton`} />}
              {job.vehicleType && <InfoRow icon="car-outline" label="Araç Tipi" value={job.vehicleType} />}
              {job.productType && <InfoRow icon="cube-outline" label="Ürün Cinsi" value={job.productType} />}
              {job.loadingDate && <InfoRow icon="calendar-outline" label="Yükleme Tarihi" value={job.loadingDate} />}
            </View>
          </View>
        )}

        {/* AÇIKLAMA */}
        {job.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <View style={styles.sectionCard}>
              <Text style={styles.descText}>{job.description}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* BAŞVUR BUTONU */}
      {String(job.ownerId?._id || job.ownerId) !== String(userId) && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Başvur</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  backBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
  scrollContent: { paddingBottom: 100 },
  // BAŞLIK
  titleCard: {
    backgroundColor: "#FFF", padding: 20, marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  jobTitle: { fontSize: 20, fontWeight: "700", color: "#222" },
  jobCompany: { fontSize: 14, color: "#888", marginTop: 4 },
  priceBadge: { alignSelf: "flex-start", marginTop: 12, backgroundColor: "#E8F5E9", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  priceText: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  // DETAY BÖLÜM
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: "#888",
    paddingHorizontal: 16, paddingVertical: 10,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sectionCard: { backgroundColor: "#FFF", borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EBEBEB' },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { fontSize: 14, color: "#666", fontWeight: "500" },
  infoValue: { fontSize: 14, color: "#222", fontWeight: "600", maxWidth: "50%", textAlign: "right" },
  descText: { fontSize: 14, color: "#444", lineHeight: 22, padding: 16 },
  // FOOTER
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFF", padding: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: "#EBEBEB",
  },
  applyBtn: { backgroundColor: "#28A745", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  applyBtnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
});
