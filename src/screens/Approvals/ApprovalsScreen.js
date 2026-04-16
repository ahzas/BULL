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

  // Sekme yönetimi (Sadece İşverenler için, İşçide sadece Onay Bekleyenler var)
  const [activeTab, setActiveTab] = useState("hires");

  const fetchApprovals = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(
        `${API_BASE}/jobs/approvals/${userId}/${role}`,
      );
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchApprovals();
    }, [userId, isEmployer]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchApprovals();
  };

  const handleHireWorker = async (jobId, workerId, workerName) => {
    Alert.alert(
      "İşe Alım Onayı",
      `${workerName} adlı işçiyi bu iş için onaylamak istiyor musunuz? İş başlayacaktır.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet, İşe Al",
          onPress: async () => {
            try {
              await axios.put(`${API_BASE}/jobs/${jobId}/hire`, { workerId });
              Alert.alert("Başarılı", "İşçi başarıyla işe alındı!");
              fetchApprovals();
            } catch (error) {
              Alert.alert("Hata", "İşlem başarısız oldu.");
            }
          },
        },
      ],
    );
  };

  const handleApproveCompletion = async (jobId) => {
    const titleText = isEmployer ? "İş Tamamlandı" : "İşi Tamamladım";
    const msgText = isEmployer
      ? "Bu işin başarıyla tamamlandığını onaylıyor musunuz? (İki taraf da onayladığında iş kapanır)"
      : "Bu işi bitirdiğinizi onaylıyor musunuz? (Kazancınız hesabınıza yansıyacaktır)";

    Alert.alert(titleText + " Onayı", msgText, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Onayla",
        onPress: async () => {
          try {
            const putRes = await axios.put(`${API_BASE}/jobs/${jobId}/approve-completion`, {
              role,
            });
            if (putRes.data.job.status === "completed") {
                Alert.alert("İş Tamamlandı! 🎉", "İş başarıyla tamamlandı. Lütfen 'İşlerim' -> 'Geçmiş İşler' sekmesine giderek karşı tarafı değerlendirin / Puan verin.");
            } else {
                Alert.alert("Başarılı", "Onayınız iletildi. Karşı taraf da işin bittiğini onayladığında değerlendirme yapabileceksiniz.");
            }
            fetchApprovals();
          } catch (error) {
            Alert.alert("Hata", "İşlem sırasında bir sorun oluştu.");
          }
        },
      },
    ]);
  };

  // 1- Başvuranlar Listesi Elemanı (Sadece İşveren Görecek)
  const renderHireItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.cardIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="briefcase" size={18} color="#003366" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobSub}>
              {item.applicants.length} başvuru
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.applicantHeader}>Başvuranlar</Text>
        {item.applicants.map((worker) => (
          <View key={worker._id || worker.id} style={styles.applicantRow}>
            <View style={styles.applicantAvatar}>
              <Text style={styles.applicantInitial}>
                {(worker.name || "?")[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.workerName}>
                {worker.name || "İsimsiz İşçi"}
              </Text>
              <Text style={styles.workerRating}>
                ⭐ {worker.rating ? worker.rating.toFixed(1) : "5.0"}
                <Text style={{ fontSize: 11, color: "#8C95A3", fontWeight: "normal" }}> ({worker.ratingCount || 0})</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.hireButton}
              onPress={() =>
                handleHireWorker(
                  item._id || item.id,
                  worker._id || worker.id,
                  worker.name || "İşçi",
                )
              }
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.hireText}>İşe Al</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // 1b- İşçinin Başvuruları Listesi Elemanı (Sadece İşçi Görecek)
  const renderWorkerHireItem = ({ item }) => {
    const owner = item.ownerId;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.cardIconBox, { backgroundColor: '#FFF4E5' }]}>
            <Ionicons name="time" size={18} color="#E67E22" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobSub}>
              {owner?.name || owner?.company || item.company || "İşveren"}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Ionicons name="hourglass-outline" size={14} color="#E67E22" />
            <Text style={styles.statusPillText}>Onay Bekleniyor</Text>
          </View>
          <Text style={styles.statusDesc}>
            Başvurunuz iletildi. İşverenin onayı bekleniyor.
          </Text>
        </View>
      </View>
    );
  };

  // 2- İş Bitimi Onay Bekleyenler Listesi Elemanı
  const renderCompletionItem = ({ item }) => {
    // Kullanıcının daha önce onay verip vermediğine bakalım (buton durumunu değiştirmek için)
    const hasApproved = isEmployer
      ? item.employerApproved
      : item.workerApproved;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.cardIconBox, { backgroundColor: '#E8F5EC' }]}>
            <Ionicons name="checkmark-done" size={18} color="#28A745" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={[styles.jobSub, { color: "#1B7A30", fontWeight: "700" }]}>
              Aktif Çalışma — {item.price} ₺
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <View style={[styles.statusPill, hasApproved && { backgroundColor: '#E8F5EC' }]}>
            <Ionicons
              name={hasApproved ? "checkmark-circle" : "information-circle-outline"}
              size={14}
              color={hasApproved ? "#28A745" : "#E67E22"}
            />
            <Text style={[styles.statusPillText, hasApproved && { color: "#28A745" }]}>
              {hasApproved ? "Onaylandı" : "Bekliyor"}
            </Text>
          </View>
          <Text style={styles.statusDesc}>
            {hasApproved
              ? "Siz onayladınız. Diğer tarafın onayı bekleniyor."
              : "Çalışma devam ediyor. Bittiğinde onaylayınız."}
          </Text>
        </View>

        {!hasApproved && (
          <TouchableOpacity
            style={styles.completionButton}
            onPress={() => handleApproveCompletion(item._id || item.id)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="checkmark-done-circle"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.completionBtnText}>
              {isEmployer ? "İş Tamamlandı" : "İşi Tamamladım"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Onay Bekleyenler</Text>
      </View>

      {/* Sekmeleri Göster (İşveren ve İşçi) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "hires" && styles.activeTab]}
          onPress={() => setActiveTab("hires")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "hires" && styles.activeTabText,
            ]}
          >
            {isEmployer ? "Başvurular" : "Başvurularım"} ({pendingHires.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "completions" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("completions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completions" && styles.activeTabText,
            ]}
          >
            İş Bitimi ({pendingCompletions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "hires" ? pendingHires : pendingCompletions}
          renderItem={
            activeTab === "hires"
              ? (isEmployer ? renderHireItem : renderWorkerHireItem)
              : renderCompletionItem
          }
          keyExtractor={(item, index) =>
            item._id?.toString() || index.toString()
          }
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#003366"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="checkmark-circle-outline" size={40} color="#B8BEC7" />
              </View>
              <Text style={styles.emptyTitle}>Bekleyen işlem yok</Text>
              <Text style={styles.emptyText}>
                Herhangi bir onay bekleyen işlem bulunmuyor.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#1A1D21" },

  // TAB STİLLERİ
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#EDEAE4",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 11 },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  activeTabText: { color: "#1A1D21" },

  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },

  // KART
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#1B2E4B",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D21",
    marginBottom: 2,
  },
  jobSub: { fontSize: 13, color: "#6B7280" },
  divider: { height: 1, backgroundColor: "#F3F1ED", marginVertical: 12 },

  // BAŞVURU KISMI
  applicantHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8C95A3",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F4F0",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  applicantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  applicantInitial: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  workerName: { fontSize: 15, fontWeight: "700", color: "#1A1D21" },
  workerRating: {
    fontSize: 12,
    color: "#E5A100",
    marginTop: 2,
    fontWeight: "700",
  },
  hireButton: {
    backgroundColor: "#003366",
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  hireText: { color: "#FFF", fontSize: 13, fontWeight: "700" },

  // ONAY KISMI
  statusRow: { marginBottom: 12 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    marginBottom: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E67E22',
  },
  statusDesc: { fontSize: 13, color: "#4A5568", lineHeight: 18 },
  completionButton: {
    backgroundColor: "#28A745",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  completionBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  // BOŞ VE YÜKLENİYOR
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#EDEAE4',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#4A5568", marginBottom: 6 },
  emptyText: { color: "#8C95A3", fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
