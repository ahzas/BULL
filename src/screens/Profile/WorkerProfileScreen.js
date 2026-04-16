import { Ionicons } from "@expo/vector-icons";
import { useContext, useState, useEffect, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import API_BASE from "../../config/api";
import { AuthContext } from "../../context/AuthContext";
import { getCommissionTier } from "../../utils/commission";

const PastJobCard = ({ item }) => {
  const isUrl = typeof item.image === "string" && item.image.startsWith("http");
  const iconName = item.image && typeof item.image === "string" && item.image.length > 0 ? item.image : "briefcase-outline";

  return (
    <View style={styles.jobCard}>
      <View style={styles.jobCardHeader}>
        <View style={styles.jobCardInfoContainer}>
          <View style={styles.jobImageContainer}>
            {isUrl ? (
              <Image source={{ uri: item.image }} style={styles.jobCardImage} />
            ) : (
              <Ionicons name={iconName} size={24} color="#003366" />
            )}
          </View>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobSubText}>{item.company}</Text>
          </View>
        </View>
        <View style={styles.jobRatingBadge}>
          <Ionicons name="star" size={10} color="#FFF" />
          <Text style={styles.jobRatingText}>{item.rating || "5.0"}</Text>
        </View>
      </View>
      <View style={styles.jobCardFooter}>
        <View style={styles.jobLocationContainer}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.jobLocation}>{item.location || item.fromCity || "Konum Belirtilmemiş"}</Text>
        </View>
        <Text style={styles.jobPrice}>{item.price} TL</Text>
      </View>
    </View>
  );
};

export default function WorkerProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("Geçmiş İşlerim");
  const [pastJobs, setPastJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchPastJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const userId = user?.user?._id || user?._id;
      if (userId) {
        const response = await axios.get(`${API_BASE}/jobs/my-jobs/${userId}`);
        setPastJobs(response.data.pastJobs || []);
      }
    } catch (error) {
      console.error("Geçmiş işler çekilirken hata:", error);
    } finally {
      setLoadingJobs(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "Geçmiş İşlerim") {
      fetchPastJobs();
    }
  }, [activeTab, fetchPastJobs]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşçi Profilim</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabContainer}>
          {["Geçmiş İşlerim", "İstatistik & Kademe", "Hesap Bilgileri"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "Geçmiş İşlerim" && (
          <View style={styles.section}>
            {loadingJobs ? (
              <ActivityIndicator size="large" color="#003366" style={{ marginTop: 20 }} />
            ) : pastJobs.length > 0 ? (
              pastJobs.map((job, index) => <PastJobCard key={job._id || index} item={job} />)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>Henüz tamamlanmış işiniz bulunmuyor.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "İstatistik & Kademe" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İstatistikler & Kademe</Text>
            <View style={[styles.accountCard, { marginBottom: 20 }]}>
              <View style={styles.accountRow}>
                <Ionicons name="trending-up" size={20} color="#28A745" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>Komisyon Kademesi</Text>
                  <Text style={styles.accountRowValue}>{getCommissionTier(user?.streak || 0).label}</Text>
                </View>
              </View>
              <View style={styles.accountDivider} />
              <View style={styles.accountRow}>
                <Ionicons name="pie-chart-outline" size={20} color="#6366F1" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>İşlem Bedeli Kesintisi</Text>
                  <Text style={styles.accountRowValue}>İşçi %{(getCommissionTier(user?.streak || 0).workerRate * 100).toFixed(0)} | İşveren %{(getCommissionTier(user?.streak || 0).employerRate * 100).toFixed(0)}</Text>
                </View>
              </View>
              <View style={styles.accountDivider} />
              <View style={styles.accountRow}>
                <Ionicons name="flame" size={20} color="#EF4444" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>Aktif Seri (Streak)</Text>
                  <Text style={styles.accountRowValue}>{user?.streak || 0} Gün</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "Hesap Bilgileri" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
            <View style={styles.accountCard}>
              <View style={styles.accountRow}>
                <Ionicons name="mail-outline" size={20} color="#64748B" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>E-posta</Text>
                  <Text style={styles.accountRowValue}>{user?.user?.email || user?.email || "Belirtilmemiş"}</Text>
                </View>
              </View>
              <View style={styles.accountDivider} />
              <View style={styles.accountRow}>
                <Ionicons name="call-outline" size={20} color="#64748B" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>Telefon</Text>
                  <Text style={styles.accountRowValue}>{user?.user?.phone || user?.phone || "Belirtilmemiş"}</Text>
                </View>
              </View>
              <View style={styles.accountDivider} />
              <View style={styles.accountRow}>
                <Ionicons name="location-outline" size={20} color="#64748B" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>Bölge / Şehir</Text>
                  <Text style={styles.accountRowValue}>
                    {user?.user?.region || user?.region || "-"} {user?.user?.city || user?.city || "-"}
                  </Text>
                </View>
              </View>
              <View style={styles.accountDivider} />
              <View style={styles.accountRow}>
                <Ionicons name="calendar-outline" size={20} color="#64748B" />
                <View style={styles.accountRowText}>
                  <Text style={styles.accountRowLabel}>Kayıt Tarihi</Text>
                  <Text style={styles.accountRowValue}>
                    {user?.user?.createdAt || user?.createdAt ? new Date(user?.user?.createdAt || user?.createdAt).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  section: { paddingHorizontal: 20, paddingTop: 25 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#94A3B8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, marginLeft: 5 },
  tabContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#003366",
    elevation: 2,
    shadowColor: "#003366",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  tabTextActive: { color: "#FFF" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 50 },
  emptyText: { color: "#94A3B8", marginTop: 12, fontSize: 14, fontWeight: "500" },
  jobCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 1,
  },
  jobCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  jobCardInfoContainer: { flexDirection: "row", alignItems: "center" },
  jobImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  jobCardImage: { width: 44, height: 44, borderRadius: 22 },
  jobTitleContainer: { marginLeft: 12 },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  jobRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28A745",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jobRatingText: { color: "#FFF", fontSize: 12, fontWeight: "bold", marginLeft: 4 },
  jobSubText: { color: "#64748B", fontSize: 13, marginTop: 2 },
  jobCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  jobLocationContainer: { flexDirection: "row", alignItems: "center" },
  jobLocation: { color: "#64748B", fontSize: 12, marginLeft: 6, fontWeight: "500" },
  jobPrice: { color: "#003366", fontWeight: "800", fontSize: 16 },
  accountCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  accountRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  accountRowText: { marginLeft: 15, flex: 1 },
  accountRowLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" },
  accountRowValue: { fontSize: 15, color: "#1E293B", marginTop: 2, fontWeight: "500" },
  accountDivider: { height: 1, backgroundColor: "#F1F5F9", marginLeft: 35 }
});
