// src/screens/Profile/ActiveWorkersScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";

const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  let birthDate;
  if (birthDateStr.includes("/")) {
    const [day, month, year] = birthDateStr.split("/");
    birthDate = new Date(`${year}-${month}-${day}`);
  } else {
    birthDate = new Date(birthDateStr);
  }
  if (isNaN(birthDate)) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const WorkerCard = ({ item }) => {
  const worker = item.worker;
  if (!worker) return null;
  const age = calculateAge(worker.birthDate);

  return (
    <View style={styles.card}>
      {/* İş Bilgisi Başlık */}
      <View style={styles.jobBadge}>
        <Ionicons name="briefcase" size={14} color="#003366" />
        <Text style={styles.jobBadgeText} numberOfLines={1}>{item.jobTitle}</Text>
        <Text style={styles.jobPrice}>{item.jobPrice} ₺</Text>
      </View>

      <View style={styles.workerRow}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.avatar}
          />
          <View style={styles.onlineDot} />
        </View>

        {/* Kişisel Bilgiler */}
        <View style={styles.infoCol}>
          <Text style={styles.workerName}>{worker.name || "İsimsiz"}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.infoText}>
              {worker.rating?.toFixed(1) || "5.0"}
              <Text style={styles.infoSub}> ({worker.ratingCount || 0})</Text>
            </Text>
          </View>

          {age && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" />
              <Text style={styles.infoText}>{age} yaşında</Text>
            </View>
          )}

          {worker.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={13} color="#64748B" />
              <Text style={styles.infoText} numberOfLines={1}>{worker.email}</Text>
            </View>
          )}

          {(worker.city || worker.region) && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.infoText}>
                {[worker.region, worker.city].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* İş Detay Alt Bilgi */}
      <View style={styles.jobFooter}>
        <View style={styles.jobFooterItem}>
          <Ionicons name="location-outline" size={13} color="#94A3B8" />
          <Text style={styles.jobFooterText}>{item.jobLocation || "Belirtilmemiş"}</Text>
        </View>
        {item.jobCategory && (
          <View style={styles.jobFooterItem}>
            <Ionicons name="pricetag-outline" size={13} color="#94A3B8" />
            <Text style={styles.jobFooterText}>{item.jobCategory}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function ActiveWorkersScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveWorkers = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_BASE}/jobs/active-workers/${userId}`);
      setWorkers(response.data || []);
    } catch (error) {
      console.log("Aktif çalışan çekme hatası:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchActiveWorkers();
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveWorkers();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Aktif Çalışanlarım</Text>
          <Text style={styles.headerSub}>
            {workers.length > 0
              ? `${workers.length} personel aktif olarak çalışıyor`
              : "Henüz aktif çalışanınız yok"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item, index) => item.jobId?.toString() || index.toString()}
          renderItem={({ item }) => <WorkerCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#003366"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={70} color="#DDDAD4" />
              <Text style={styles.emptyTitle}>Henüz Aktif Çalışan Yok</Text>
              <Text style={styles.emptyText}>
                Bir iş ilanınıza başvuran işçiyi işe aldığınızda burada görünecektir.
                İş karşılıklı tamamlandığında liste sıfırlanır.
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D21",
  },
  headerSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 0,
    elevation: 1,
    shadowColor: "#1B2E4B",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  jobBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    gap: 6,
  },
  jobBadgeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#003366",
  },
  jobPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#28A745",
  },
  workerRow: {
    flexDirection: "row",
    gap: 14,
  },
  avatarBox: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F3F1ED",
    borderWidth: 2,
    borderColor: "#E8E4DE",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#28A745",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  infoCol: {
    flex: 1,
    gap: 5,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1D21",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
  },
  infoSub: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "normal",
  },
  jobFooter: {
    flexDirection: "row",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F1ED",
    gap: 16,
  },
  jobFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobFooterText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A5568",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
