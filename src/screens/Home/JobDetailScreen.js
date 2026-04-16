import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const API_URL = `${API_BASE}/jobs`;

  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;

  // Kullanıcı ilanın sahibi mi ve rolü ne?
  const isEmployerMode = userData?.role === "employer";
  const isOwner = job.ownerId?._id === userId || job.ownerId === userId;

  const handleApply = async () => {
    if (isEmployerMode) {
      Alert.alert("Bilgi", "İşveren modundayken işlere başvuramazsınız.");
      return;
    }
    
    if (isOwner) {
      Alert.alert("Hata", "Kendi yayınladığınız ilana başvuramazsınız.");
      return;
    }

    if (!userId) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı.");
      return;
    }

    setLoading(true);
    try {
      const jobId = job._id || job.id;
      const res = await axios.post(`${API_URL}/${jobId}/apply`, {
        userId: userId,
      });

      Alert.alert(
        "Başarılı",
        "Başvurunuz iletildi! İşveren onayladığında bildirim alacaksınız.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Başvuru yapılamadı.";
      Alert.alert("Başvuru Başarısız", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isUrl = typeof job.image === "string" && job.image.startsWith("http");

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A1D21" />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>İlan Detayı</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={20} color="#1A1D21" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ANA BİLGİ */}
        <View style={styles.mainInfo}>
          <View style={styles.imageBox}>
            {isUrl ? (
              <Image source={{ uri: job.image }} style={styles.jobImage} />
            ) : (
              <Ionicons
                name={job.image || "briefcase-outline"}
                size={40}
                color="#003366"
              />
            )}
          </View>

          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>

          {job.serviceType === "Bull-Tır" && (
             <View style={styles.tirBadge}>
                <Ionicons name="bus" size={14} color="#E67E22" />
                <Text style={styles.tirBadgeText}>Bull-Tır İlanı</Text>
             </View>
          )}

          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#E5A100" />
              <Text style={styles.ratingText}>
                {job.rating || "5.0"} İşveren Puanı
              </Text>
            </View>
          </View>
        </View>

        {/* DETAY KARTLARI */}
        <View style={styles.detailsRow}>
          <View style={[styles.detailBox, { backgroundColor: '#E8F5EC' }]}>
            <Ionicons name="cash-outline" size={20} color="#1B7A30" />
            <Text style={styles.detailLabel}>Ücret</Text>
            <Text style={[styles.detailValue, { color: '#1B7A30' }]}>{job.price} ₺</Text>
          </View>

          <View style={[styles.detailBox, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="location-outline" size={20} color="#003366" />
            <Text style={styles.detailLabel}>Konum</Text>
            <Text style={[styles.detailValue, { color: '#003366' }]} numberOfLines={2}>
              {job.serviceType === "Bull-Tır" ? job.fromDistrict : job.location}
            </Text>
          </View>

          <View style={[styles.detailBox, { backgroundColor: '#F3F1ED' }]}>
            <Ionicons name="grid-outline" size={20} color="#6B7280" />
            <Text style={styles.detailLabel}>Sektör</Text>
            <Text style={[styles.detailValue, { color: '#4A5568' }]} numberOfLines={2}>{job.category || "Genel"}</Text>
          </View>
        </View>

        {job.serviceType === "Bull-Tır" && (
          <View style={styles.tirCard}>
            <View style={styles.tirCardHeader}>
              <Ionicons name="cube-outline" size={20} color="#E67E22" />
              <Text style={styles.tirTitle}>Lojistik Yük Detayları</Text>
            </View>
            
            <View style={styles.tirRow}>
              <View style={[styles.tirDot, { backgroundColor: '#003366' }]} />
              <Text style={styles.tirText}><Text style={{fontWeight:'700'}}>Yükleme:</Text> {job.fromLocation}</Text>
            </View>
            <View style={styles.tirRow}>
              <View style={[styles.tirDot, { backgroundColor: '#28A745' }]} />
              <Text style={styles.tirText}><Text style={{fontWeight:'700'}}>Teslimat:</Text> {job.toLocation}</Text>
            </View>
            <View style={styles.tirDivider} />
            <View style={styles.tirRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" style={{width: 18}} />
              <Text style={styles.tirText}><Text style={{fontWeight:'700'}}>Tarih:</Text> {job.loadingDate}</Text>
            </View>
            <View style={styles.tirRow}>
              <Ionicons name="scale-outline" size={16} color="#6B7280" style={{width: 18}} />
              <Text style={styles.tirText}><Text style={{fontWeight:'700'}}>Tonaj / Ürün:</Text> {job.tonnage} Ton | {job.productType}</Text>
            </View>
            <View style={styles.tirRow}>
              <Ionicons name="car-outline" size={16} color="#6B7280" style={{width: 18}} />
              <Text style={styles.tirText}><Text style={{fontWeight:'700'}}>Araç:</Text> {job.vehicleType}</Text>
            </View>
          </View>
        )}

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>İş Tanımı / Notlar</Text>
          <Text style={styles.descriptionText}>
            {job.description ||
              "Bu iş kapsamında ekstra bir detay belirtilmemiştir."}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {!isEmployerMode && !isOwner && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.applyButton, loading && { opacity: 0.7 }]}
            onPress={handleApply}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.applyButtonText}>HEMEN BAŞVUR</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!isEmployerMode && isOwner && (
        <View style={styles.footer}>
          <View style={[styles.applyButton, {backgroundColor: '#EDEAE4'}]}>
             <Text style={[styles.applyButtonText, {color: '#6B7280'}]}>BU İLAN SİZE AİT</Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D21",
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
  },
  mainInfo: { alignItems: "center", padding: 24, backgroundColor: "#FFF", marginBottom: 8 },
  imageBox: {
    width: 100, height: 100, borderRadius: 24, backgroundColor: "#F3F1ED",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  jobImage: { width: 70, height: 70, borderRadius: 18 },
  title: { fontSize: 22, fontWeight: "800", color: "#1A1D21", textAlign: "center" },
  company: { fontSize: 15, color: "#6B7280", marginTop: 4, fontWeight: "500" },
  tirBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E5",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  tirBadgeText: { color: "#E67E22", fontSize: 12, fontWeight: "700" },
  badgeRow: { flexDirection: "row", marginTop: 14 },
  ratingBadge: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFF8E7",
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, gap: 6,
  },
  ratingText: { fontSize: 13, fontWeight: "700", color: "#B8860B" },
  // DETAY KARTLARI
  detailsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  detailBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  detailLabel: { fontSize: 10, color: "#6B7280", textTransform: "uppercase", marginTop: 6, fontWeight: "700", letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: "800", marginTop: 3, textAlign: 'center' },
  
  tirCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 18,
  },
  tirCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tirTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1D21",
  },
  tirRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },
  tirDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 5,
  },
  tirDivider: {
    height: 1,
    backgroundColor: '#F3F1ED',
    marginVertical: 8,
  },
  tirText: {
    fontSize: 14,
    color: "#4A5568",
    flex: 1,
    marginLeft: 6,
    lineHeight: 20
  },

  descriptionSection: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1A1D21", marginBottom: 10 },
  descriptionText: { fontSize: 15, color: "#4A5568", lineHeight: 23 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFF", padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  applyButton: {
    backgroundColor: "#28A745", height: 56, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  applyButtonText: { color: "#FFF", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
});
