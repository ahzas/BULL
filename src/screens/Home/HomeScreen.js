import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { JobContext } from "../../context/JobContext";
import API_BASE from "../../config/api";

// --- ROL YÖNETİMİ ---
// Bu değer ilerde veritabanından/auth context'ten gelecek.

const JobCard = ({ item, navigation }) => {
  const imageVal = item.image;
  const isUrl = typeof imageVal === "string" && imageVal.startsWith("http");
  const iconName =
    imageVal && typeof imageVal === "string" && imageVal.length > 0
      ? imageVal
      : "briefcase-outline";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("JobDetail", { job: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfoContainer}>
          <View style={styles.imageContainer}>
            {isUrl ? (
              <Image source={{ uri: imageVal }} style={styles.cardImage} />
            ) : (
              <Ionicons name={iconName} size={24} color="#003366" />
            )}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.subText}>{item.company}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFF" />
          <Text style={styles.ratingText}>{item.rating || "5.0"}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <Text style={styles.price}>{item.price} TL</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { jobs, setJobs } = useContext(JobContext);
  const { user, isEmployerMode } = useContext(AuthContext);
  const USER_ROLE = isEmployerMode ? "employer" : user?.role || "worker";

  const API_URL = `${API_BASE}/jobs`;

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setJobs(response.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [setJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // --- ROL TABANLI ASİMETRİK FİLTRELEME ---
  const dynamicData = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase());

    if (USER_ROLE === "worker") {
      // İşçiysen sadece 'job_offer' (işveren ilanlarını) gör
      return matchesSearch && job.type === "job_offer";
    } else {
      // İşverensen sadece 'skill_profile' (işçilerin yetenek profillerini) gör
      return matchesSearch && job.type === "skill_profile";
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            {/* Eğer user.name varsa onu, yoksa "Vezir" yazdır */}
            Merhaba, {user?.name ? user.name : "Vezir"} 👋
          </Text>
          <Text style={styles.subTitle}>
            {USER_ROLE === "worker"
              ? "Sana uygun en güncel işleri listeledik"
              : "İşletmen için en yetenekli personeller"}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          placeholder={
            USER_ROLE === "worker" ? "İş veya şirket ara..." : "Personel ara..."
          }
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#003366"
          style={{ marginTop: 20 }}
        />
      )}

      <FlatList
        data={dynamicData}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <JobCard item={item} navigation={navigation} />
        )}
        contentContainerStyle={{ padding: 20 }}
        onRefresh={fetchJobs}
        refreshing={loading}
        ListEmptyComponent={() =>
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={50} color="#E2E8F0" />
              <Text style={styles.emptyText}>Henüz bir kayıt bulunamadı.</Text>
            </View>
          )
        }
      />

      {isEmployerMode ? (
        <TouchableOpacity
          style={styles.fabEmployer}
          onPress={() => navigation.navigate("PostJob")}
          activeOpacity={0.85}
        >
          <View style={styles.fabEmployerInner}>
            <View style={styles.fabEmployerIconBox}>
              <Ionicons name="briefcase" size={22} color="#FFF" />
            </View>
            <View style={styles.fabEmployerTextBox}>
              <Text style={styles.fabEmployerTitle}>İlan Yayınla</Text>
              <Text style={styles.fabEmployerSub}>Yeni iş ilanı oluştur</Text>
            </View>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color="rgba(255,255,255,0.7)"
            />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("PostJob")}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20 },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  subTitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  searchContainer: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfoContainer: { flexDirection: "row", alignItems: "center" },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardImage: { width: 44, height: 44, borderRadius: 22 },
  titleContainer: { marginLeft: 12 },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28A745",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  subText: { color: "#64748B", fontSize: 13, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  location: { color: "#94A3B8", fontSize: 12, marginLeft: 4 },
  price: { color: "#28A745", fontWeight: "bold", fontSize: 15 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#003366",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabEmployer: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#003366",
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  fabEmployerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fabEmployerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  fabEmployerTextBox: {
    flex: 1,
    marginLeft: 14,
  },
  fabEmployerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  fabEmployerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#64748B", marginTop: 10, fontSize: 16 },
});
