// src/screens/MyJobs/MyJobsScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
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

export default function MyJobsScreen() {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;

  const [activeTab, setActiveTab] = useState("active"); // 'active' veya 'past'
  const [activeJobs, setActiveJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_BASE}/jobs/my-jobs/${userId}`);
      if (response.data) {
        setActiveJobs(response.data.activeJobs || []);
        setPastJobs(response.data.pastJobs || []);
      }
    } catch (error) {
      console.log("İşlerim çekilemedi:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchJobs();
    }, [userId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const renderJobItem = ({ item }) => {
    const isCompleted = item.status === "completed";
    // Mongoose populate ile assignedTo gelmişse
    const workerName = item.assignedTo?.name || null;
    const workerRating = item.assignedTo?.rating || null;

    // Tarih formatı (aktifse createdAt, geçmişse completedAt veya createdAt)
    const rawDate = isCompleted
      ? item.completedAt || item.createdAt
      : item.createdAt;
    const dateObj = new Date(rawDate);
    const dateStr = dateObj.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <View style={styles.jobCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleCol}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isCompleted ? "#DCFCE7" : "#DBEAFE" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isCompleted ? "#166534" : "#1E40AF" },
              ]}
            >
              {isCompleted ? "Tamamlandı" : "Aktif"}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" />
              <Text style={styles.infoText}>{dateStr}</Text>
            </View>

            {/* Tamamlanan işlerde işçi bilgisi varsa göster */}
            {isCompleted && workerName && (
              <View style={[styles.infoRow, { marginTop: 6 }]}>
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color="#003366"
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: "#003366", fontWeight: "bold" },
                  ]}
                >
                  {workerName}{" "}
                  <Text style={{ fontWeight: "normal", color: "#64748B" }}>
                    ({workerRating ? `⭐${workerRating.toFixed(1)}` : "Çalışan"}
                    )
                  </Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceCol}>
            <Text style={styles.priceValue}>{item.price} ₺</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İşlerim</Text>
      </View>

      {/* CUSTOM TAB NAVIGATOR */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Aktif İlanlarım ({activeJobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.activeTabText,
            ]}
          >
            Geçmiş İşler ({pastJobs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "active" ? activeJobs : pastJobs}
          renderItem={renderJobItem}
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
              <Ionicons name="briefcase-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {activeTab === "active"
                  ? "Henüz aktif bir ilanınız bulunmuyor."
                  : "Tamamlanmış geçmiş bir işiniz yok."}
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
  // KART STİLLERİ
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  jobCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleCol: { flex: 1, paddingRight: 10 },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  companyName: { fontSize: 13, color: "#64748B", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  cardDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 13, color: "#64748B", marginLeft: 6 },
  priceCol: { alignItems: "flex-end", justifyContent: "flex-end" },
  priceValue: { fontSize: 16, fontWeight: "bold", color: "#28A745" },
  // BOŞ DURUM VE YÜKLENİYOR
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 100 },
  emptyText: {
    marginTop: 15,
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
