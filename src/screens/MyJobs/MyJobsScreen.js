// src/screens/MyJobs/MyJobsScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";

export default function MyJobsScreen() {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;
  const isEmployer = userData?.role === "employer";
  const role = isEmployer ? "employer" : "worker";

  const [activeTab, setActiveTab] = useState("active");
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [pendingHires, setPendingHires] = useState([]);
  const [pendingCompletions, setPendingCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Puanlama
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);

  const fetchAll = async () => {
    if (!userId) return;
    try {
      const [jobsRes, approvalsRes] = await Promise.all([
        axios.get(`${API_BASE}/jobs/my-jobs/${userId}`),
        axios.get(`${API_BASE}/jobs/approvals/${userId}/${role}`),
      ]);
      if (jobsRes.data) {
        setActiveJobs(jobsRes.data.activeJobs || []);
        setCompletedJobs(jobsRes.data.pastJobs || []);
      }
      if (approvalsRes.data) {
        setPendingHires(approvalsRes.data.pendingHires || []);
        setPendingCompletions(approvalsRes.data.pendingCompletions || []);
      }
    } catch (error) {
      console.log("Veri çekilemedi:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchAll(); }, [userId]));
  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  // --- PUANLAMA ---
  const openRating = (job) => { setSelectedJob(job); setRatingScore(5); setRatingModal(true); };
  const submitRating = async () => {
    if (!selectedJob) return;
    try {
      const targetId = isEmployer
        ? selectedJob.assignedTo?._id || selectedJob.assignedTo
        : selectedJob.ownerId?._id || selectedJob.ownerId;
      await axios.post(`${API_BASE}/jobs/${selectedJob._id}/rate`, {
        targetUserId: targetId, ratingValue: ratingScore, role
      });
      Alert.alert("Teşekkürler", "Puanınız kaydedildi.");
      setRatingModal(false);
      fetchAll();
    } catch (error) {
      Alert.alert("Hata", error.response?.data?.message || "Puanlama yapılamadı.");
    }
  };

  // --- ONAY İŞLEMLERİ ---
  const handleHireWorker = async (jobId, workerId, workerName) => {
    Alert.alert("İşe Al", `${workerName} adlı kişiyi onaylamak istiyor musunuz?`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Onayla", onPress: async () => {
          try {
            await axios.put(`${API_BASE}/jobs/${jobId}/hire`, { workerId });
            Alert.alert("Başarılı", "İşçi işe alındı!");
            fetchAll();
          } catch { Alert.alert("Hata", "İşlem başarısız."); }
        },
      },
    ]);
  };

  const handleApproveCompletion = async (jobId) => {
    Alert.alert("Onay", "İşin tamamlandığını onaylıyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Onayla", onPress: async () => {
          try {
            const res = await axios.put(`${API_BASE}/jobs/${jobId}/approve-completion`, { role });
            if (res.data.job.status === "completed") {
              Alert.alert("Tamamlandı! 🎉", "İş başarıyla tamamlandı.");
            } else {
              Alert.alert("Başarılı", "Onayınız iletildi. Karşı tarafın onayı bekleniyor.");
            }
            fetchAll();
          } catch { Alert.alert("Hata", "İşlem sırasında sorun oluştu."); }
        },
      },
    ]);
  };

  // --- RENDER: AKTİF / GEÇMİŞ İŞ KARTI ---
  const getStatusInfo = (job) => {
    if (activeTab === "active") {
      if (job.status === "in_progress") return { label: "Devam Ediyor", color: "#28A745" };
      return { label: "Aktif", color: "#003366" };
    }
    return { label: "Tamamlandı", color: "#888" };
  };

  const renderJobItem = ({ item }) => {
    const status = getStatusInfo(item);
    const hasRated = isEmployer ? item.employerRated : item.workerRated;
    const canRate = activeTab === "completed" && !hasRated;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardCompany}>{item.company}</Text>
          </View>
          <Text style={styles.cardPrice}>{item.price} ₺</Text>
        </View>
        <View style={styles.cardBottom}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          {canRate && (
            <TouchableOpacity style={styles.rateBtn} onPress={() => openRating(item)}>
              <Text style={styles.rateBtnText}>Puan Ver</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // --- RENDER: ONAY KARTI ---
  const renderApprovalItem = ({ item }) => {
    // 1. Henüz işe başlanmamış (başvurulmuş) ilan durumu
    if (item.status === "active") {
      if (isEmployer) {
        return (
          <View style={styles.approvalCard}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCompany}>{item.applicants?.length || 0} başvuru</Text>
            <View style={styles.divider} />
            {item.applicants?.map((worker) => (
              <View key={worker._id || worker.id} style={styles.applicantRow}>
                <View style={styles.applicantAvatar}>
                  <Text style={styles.avatarLetter}>{(worker.name || "?")[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.applicantName}>{worker.name || "İsimsiz"}</Text>
                  <Text style={styles.applicantRating}>⭐ {worker.rating?.toFixed(1) || "5.0"}</Text>
                </View>
                <TouchableOpacity style={styles.hireBtn} onPress={() => handleHireWorker(item._id || item.id, worker._id || worker.id, worker.name || "İşçi")}>
                  <Text style={styles.hireBtnText}>İşe Al</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      } else {
        return (
          <View style={styles.approvalCard}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCompany}>{item.ownerId?.name || item.company || "İşveren"}</Text>
            <View style={styles.cardBottom}>
              <View style={[styles.statusDot, { backgroundColor: '#F5A623' }]} />
              <Text style={styles.statusText}>İşverenin Onayı Bekleniyor</Text>
            </View>
          </View>
        );
      }
    }

    // İş bitimi onayı
    const hasApproved = isEmployer ? item.employerApproved : item.workerApproved;
    return (
      <View style={styles.approvalCard}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPrice}>{item.price} ₺</Text>
        </View>
        <View style={styles.cardBottom}>
          <View style={[styles.statusDot, { backgroundColor: hasApproved ? '#28A745' : '#F5A623' }]} />
          <Text style={styles.statusText}>{hasApproved ? "Onayladınız" : "Onay Bekliyor"}</Text>
        </View>
        {!hasApproved && (
          <TouchableOpacity style={styles.completeBtn} onPress={() => handleApproveCompletion(item._id || item.id)}>
            <Text style={styles.completeBtnText}>{isEmployer ? "İş Tamamlandı" : "İşi Tamamladım"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // --- Onaylar sekmesi için combined data ---
  const approvalData = [...pendingHires, ...pendingCompletions];

  // --- Aktif sekme verisi ---
  const getTabData = () => {
    switch (activeTab) {
      case "active": return activeJobs;
      case "completed": return completedJobs;
      case "approvals": return approvalData;
      default: return [];
    }
  };

  const getTabRender = () => {
    if (activeTab === "approvals") return renderApprovalItem;
    return renderJobItem;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>İşlerim</Text>

      {/* 3 SEKME */}
      <View style={styles.tabs}>
        {[
          { key: "active", label: `Aktif (${activeJobs.length})` },
          { key: "completed", label: `Geçmiş (${completedJobs.length})` },
          { key: "approvals", label: `Onaylar (${approvalData.length})` },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#28A745" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getTabData()}
          renderItem={getTabRender()}
          keyExtractor={(item, i) => item._id?.toString() || i.toString()}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#28A745"]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name={activeTab === "approvals" ? "checkmark-circle-outline" : "folder-open-outline"} size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>
                {activeTab === "approvals" ? "Bekleyen onay yok" : "Henüz iş yok"}
              </Text>
            </View>
          }
        />
      )}

      {/* PUANLAMA MODALI */}
      <Modal visible={ratingModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setRatingModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Puanla</Text>
            <Text style={styles.sheetSub}>{selectedJob?.title}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRatingScore(s)}>
                  <Ionicons name={s <= ratingScore ? "star" : "star-outline"} size={36} color={s <= ratingScore ? "#F5A623" : "#DDD"} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.scoreLabel}>{ratingScore}/5</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={submitRating}>
              <Text style={styles.submitBtnText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#222", padding: 16, paddingBottom: 0 },
  // SEKMELER
  tabs: { flexDirection: "row", marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: "#28A745" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#999" },
  tabTextActive: { color: "#28A745" },
  // İŞ KARTI
  card: {
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
    paddingHorizontal: 4,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  cardCompany: { fontSize: 13, color: "#888", marginTop: 2 },
  cardPrice: { fontSize: 17, fontWeight: "700", color: "#28A745" },
  cardBottom: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "600", flex: 1, color: "#666" },
  rateBtn: { backgroundColor: "#28A745", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
  rateBtnText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  // ONAY KARTI
  approvalCard: {
    backgroundColor: "#FFF", borderRadius: 10, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  applicantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  applicantAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  applicantName: { fontSize: 15, fontWeight: '600', color: '#222' },
  applicantRating: { fontSize: 12, color: '#999', marginTop: 1 },
  hireBtn: { backgroundColor: '#28A745', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  hireBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  completeBtn: { backgroundColor: '#28A745', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  completeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  // BOŞ
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: { color: "#666", fontSize: 16, fontWeight: "600", marginTop: 12 },
  // MODAL
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: 36, alignItems: "center" },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDD", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: "#222" },
  sheetSub: { fontSize: 14, color: "#888", marginTop: 4, marginBottom: 20 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  scoreLabel: { fontSize: 16, fontWeight: "700", color: "#F5A623", marginBottom: 24 },
  submitBtn: { backgroundColor: "#28A745", width: "100%", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
