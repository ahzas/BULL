// src/screens/Approvals/ApprovalsScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";

export default function ApprovalsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;
  const isEmployer = userData?.role === "employer";
  const role = isEmployer ? "employer" : "worker";

  const [pendingHires, setPendingHires] = useState([]);
  const [pendingCompletions, setPendingCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("hires");

  const fetchApprovals = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_BASE}/jobs/approvals/${userId}/${role}`);
      if (response.data) {
        setPendingHires(response.data.pendingHires || []);
        setPendingCompletions(response.data.pendingCompletions || []);
      }
    } catch (error) {
      console.log("Onaylar çekilemedi:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchApprovals(); }, [userId, isEmployer]));
  const onRefresh = () => { setRefreshing(true); fetchApprovals(); };

  const handleHireWorker = async (jobId, workerId, workerName) => {
    Alert.alert("İşe Al", `${workerName} adlı kişiyi onaylamak istiyor musunuz?`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Onayla",
        onPress: async () => {
          try {
            await axios.put(`${API_BASE}/jobs/${jobId}/hire`, { workerId });
            Alert.alert("Başarılı", "İşçi işe alındı!");
            fetchApprovals();
          } catch (error) {
            Alert.alert("Hata", "İşlem başarısız.");
          }
        },
      },
    ]);
  };

  const handleApproveCompletion = async (jobId) => {
    Alert.alert("Onay", "İşin tamamlandığını onaylıyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Onayla",
        onPress: async () => {
          try {
            const res = await axios.put(`${API_BASE}/jobs/${jobId}/approve-completion`, { role });
            if (res.data.job.status === "completed") {
              Alert.alert("Tamamlandı! 🎉", "İş başarıyla tamamlandı.");
            } else {
              Alert.alert("Başarılı", "Onayınız iletildi. Karşı tarafın onayı bekleniyor.");
            }
            fetchApprovals();
          } catch (error) {
            Alert.alert("Hata", "İşlem sırasında sorun oluştu.");
          }
        },
      },
    ]);
  };

  const renderHireItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSub}>{item.applicants.length} başvuru</Text>
      <View style={styles.divider} />
      {item.applicants.map((worker) => (
        <View key={worker._id || worker.id} style={styles.applicantRow}>
          <View style={styles.applicantAvatar}>
            <Text style={styles.avatarLetter}>{(worker.name || "?")[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.applicantName}>{worker.name || "İsimsiz"}</Text>
            <Text style={styles.applicantRating}>⭐ {worker.rating?.toFixed(1) || "5.0"}</Text>
          </View>
          <TouchableOpacity
            style={styles.hireBtn}
            onPress={() => handleHireWorker(item._id || item.id, worker._id || worker.id, worker.name || "İşçi")}
          >
            <Text style={styles.hireBtnText}>İşe Al</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderWorkerHireItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSub}>{item.ownerId?.name || item.company || "İşveren"}</Text>
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: '#F5A623' }]} />
        <Text style={styles.statusLabel}>Onay Bekleniyor</Text>
      </View>
    </View>
  );

  const renderCompletionItem = ({ item }) => {
    const hasApproved = isEmployer ? item.employerApproved : item.workerApproved;
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPrice}>{item.price} ₺</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: hasApproved ? '#2E7D32' : '#F5A623' }]} />
          <Text style={styles.statusLabel}>{hasApproved ? "Onayladınız" : "Onay Bekliyor"}</Text>
        </View>
        {!hasApproved && (
          <TouchableOpacity style={styles.completeBtn} onPress={() => handleApproveCompletion(item._id || item.id)}>
            <Text style={styles.completeBtnText}>{isEmployer ? "İş Tamamlandı" : "İşi Tamamladım"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>Onaylar</Text>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === "hires" && styles.tabActive]} onPress={() => setActiveTab("hires")}>
          <Text style={[styles.tabText, activeTab === "hires" && styles.tabTextActive]}>
            {isEmployer ? "Başvurular" : "Başvurularım"} ({pendingHires.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "completions" && styles.tabActive]} onPress={() => setActiveTab("completions")}>
          <Text style={[styles.tabText, activeTab === "completions" && styles.tabTextActive]}>
            İş Bitimi ({pendingCompletions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={activeTab === "hires" ? pendingHires : pendingCompletions}
          renderItem={activeTab === "hires" ? (isEmployer ? renderHireItem : renderWorkerHireItem) : renderCompletionItem}
          keyExtractor={(item, i) => item._id?.toString() || i.toString()}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003366"]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>Bekleyen işlem yok</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#222", padding: 16, paddingBottom: 0 },
  tabs: { flexDirection: "row", marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: "#003366" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#999" },
  tabTextActive: { color: "#003366" },
  // KART
  card: {
    backgroundColor: "#FFF", borderRadius: 10, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  cardSub: { fontSize: 13, color: "#888", marginTop: 2 },
  cardPrice: { fontSize: 17, fontWeight: "700", color: "#2E7D32" },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  // BAŞVURU
  applicantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  applicantAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  applicantName: { fontSize: 15, fontWeight: '600', color: '#222' },
  applicantRating: { fontSize: 12, color: '#999', marginTop: 1 },
  hireBtn: { backgroundColor: '#003366', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  hireBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  // DURUM
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  completeBtn: { backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  completeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  // BOŞ
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: { color: "#666", fontSize: 16, fontWeight: "600", marginTop: 12 },
});
