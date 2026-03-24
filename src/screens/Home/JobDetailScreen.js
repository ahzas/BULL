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
  const { user, isEmployerMode } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const API_URL = `${API_BASE}/jobs`;

  const handleApply = async () => {
    if (isEmployerMode) {
      Alert.alert("Bilgi", "İşveren modundayken işlere başvuramazsınız.");
      return;
    }

    const userData = user?.user || user;
    const userId = userData?._id || userData?.id;

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
      // Backend'den dönen özel hataları göster (örn: "Zaten başvurdunuz")
      const errorMsg = error.response?.data?.message || "Başvuru yapılamadı.";
      Alert.alert("Başvuru Başarısız", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 1. ADIM: Tanımlanan isUrl değişkenini artık JSX içerisinde kullanarak uyarıyı gideriyoruz
  const isUrl = typeof job.image === "string" && job.image.startsWith("http");

  return (
    <SafeAreaView style={styles.container}>
      {/* ÜST BAR (Geri Dön ve Paylaş) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#003366" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="#003366" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* İŞ BİLGİLERİ */}
        <View style={styles.mainInfo}>
          <View style={styles.imageBox}>
            {/* 2. ADIM: Değişkeni burada kullanarak kod karmaşasını önledik */}
            {isUrl ? (
              <Image source={{ uri: job.image }} style={styles.jobImage} />
            ) : (
              <Ionicons
                name={job.image || "briefcase-outline"}
                size={50}
                color="#003366"
              />
            )}
          </View>

          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {job.rating || "5.0"} İşveren Puanı
              </Text>
            </View>
          </View>
        </View>

        {/* DETAYLAR KARTI */}
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={20} color="#28A745" />
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Ücret</Text>
              <Text style={styles.detailValue}>{job.price} TL</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#003366" />
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Konum</Text>
              <Text style={styles.detailValue}>{job.location}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color="#64748B" />
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Sektör</Text>
              <Text style={styles.detailValue}>{job.category || "Genel"}</Text>
            </View>
          </View>
        </View>

        {/* İŞ TANIMI */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>İş Tanımı</Text>
          <Text style={styles.descriptionText}>
            {job.description ||
              "Bu iş kapsamında ilgili işletme bünyesinde günlük destek personeli olarak görev alacaksınız."}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ALT BAŞVURU BUTONU */}
      {!isEmployerMode && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.applyButton, loading && { opacity: 0.7 }]}
            onPress={handleApply}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.applyButtonText}>HEMEN BAŞVUR</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- CSS STİLLERİ (Expanded Format) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  mainInfo: {
    alignItems: "center",
    padding: 20,
  },

  imageBox: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
  },

  company: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 5,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#B45309",
    marginLeft: 5,
  },

  detailsCard: {
    backgroundColor: "#F8FAFC",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  detailItem: {
    alignItems: "center",
    flex: 1,
  },

  detailTextCol: {
    alignItems: "center",
    marginTop: 5,
  },

  detailLabel: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#003366",
    marginTop: 2,
  },

  descriptionSection: {
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
  },

  descriptionText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  applyButton: {
    backgroundColor: "#28A745",
    height: 56,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  applyButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
