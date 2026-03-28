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
  const { user, isEmployerMode } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;
  const role = isEmployerMode ? "employer" : "worker";

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
    }, [userId, isEmployerMode]),
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
    const titleText = isEmployerMode ? "İş Tamamlandı" : "İşi Tamamladım";
    const msgText = isEmployerMode
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
        <View style={styles.cardHeader}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobSub}>
            Başvuru Sayısı: {item.applicants.length}
          </Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.applicantHeader}>Başvuranlar:</Text>
        {item.applicants.map((worker) => (
          <View key={worker._id || worker.id} style={styles.applicantRow}>
            <View>
              <Text style={styles.workerName}>
                {worker.name || "İsimsiz İşçi"}
              </Text>
              <Text style={styles.workerRating}>
                ⭐ {worker.rating ? worker.rating.toFixed(1) : "5.0"}
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "normal" }}> ({worker.ratingCount || 0} Değerlendirme)</Text>
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
        <View style={styles.cardHeaderCol}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobSub}>
            {owner?.name || owner?.company || item.company || "İşveren"}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusRow}>
          <Ionicons
            name="time-outline"
            size={20}
            color="#F59E0B"
          />
          <Text style={styles.statusText}>
            Başvurunuz iletildi. İşverenin onayı bekleniyor.
          </Text>
        </View>
      </View>
    );
  };

  // 2- İş Bitimi Onay Bekleyenler Listesi Elemanı
  const renderCompletionItem = ({ item }) => {
    // Kullanıcının daha önce onay verip vermediğine bakalım (buton durumunu değiştirmek için)
    const hasApproved = isEmployerMode
      ? item.employerApproved
      : item.workerApproved;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderCol}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text
            style={[styles.jobSub, { color: "#28A745", fontWeight: "bold" }]}
          >
            Aktif Çalışma - {item.price} ₺
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#F59E0B"
          />
          <Text style={styles.statusText}>
            {hasApproved
              ? "Siz onayladınız. Diğer tarafın onayı bekleniyor."
              : "Çalışma devam ediyor. Bittiğinde onaylayınız."}
          </Text>
        </View>

        {!hasApproved && (
          <TouchableOpacity
            style={styles.completionButton}
            onPress={() => handleApproveCompletion(item._id || item.id)}
          >
            <Ionicons
              name="checkmark-done-circle"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.completionBtnText}>
              {isEmployerMode ? "İş Tamamlandı" : "İşi Tamamladım"}
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
            {isEmployerMode ? "Başvurular" : "Başvurularım"} ({pendingHires.length})
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
              ? (isEmployerMode ? renderHireItem : renderWorkerHireItem)
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
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>
                Bekleyen herhangi bir işlem yok.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#003366" },

  // TAB STİLLERİ
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  activeTabText: { color: "#003366" },

  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },

  // KART
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderCol: { flexDirection: "column" },
  jobTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  jobSub: { fontSize: 13, color: "#64748B" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },

  // BAŞVURU KISMI
  applicantHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  applicantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  workerName: { fontSize: 15, fontWeight: "bold", color: "#003366" },
  workerRating: {
    fontSize: 12,
    color: "#D97706",
    marginTop: 2,
    fontWeight: "600",
  },
  hireButton: {
    backgroundColor: "#003366",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hireText: { color: "#FFF", fontSize: 13, fontWeight: "bold" },

  // ONAY KISMI
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  statusText: { flex: 1, fontSize: 13, color: "#475569", marginLeft: 8 },
  completionButton: {
    backgroundColor: "#28A745",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  completionBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },

  // BOŞ VE YÜKLENİYOR
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 15, color: "#94A3B8", fontSize: 15 },
});
