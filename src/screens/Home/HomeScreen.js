import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
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
  const [activeTab, setActiveTab] = useState("Bull-Part");
  const [loading, setLoading] = useState(false);
  const { jobs, setJobs } = useContext(JobContext);
  const { user } = useContext(AuthContext);
  const USER_ROLE = user?.role === "employer" || user?.user?.role === "employer" ? "employer" : "worker";

  // Sıralama ve Filtreleme State'leri
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, priceAsc, priceDesc, ratingDesc
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const CATEGORIES = [
    "Bilişim ve Teknoloji (IT)",
    "Satış ve Pazarlama",
    "Üretim ve Endüstri",
    "Lojistik ve Taşımacılık",
    "Hizmet ve Turizm",
    "Yönetim ve İdari İşler",
    "Diğer",
  ];

  const SORT_OPTIONS = [
    { key: "newest", label: "En Yeni", icon: "time-outline" },
    { key: "oldest", label: "En Eski", icon: "hourglass-outline" },
    { key: "priceDesc", label: "Fiyat (Yüksek → Düşük)", icon: "arrow-down-outline" },
    { key: "priceAsc", label: "Fiyat (Düşük → Yüksek)", icon: "arrow-up-outline" },
    { key: "ratingDesc", label: "Puan (En Yüksek)", icon: "star-outline" },
  ];

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

  // --- ROL TABANLI ASİMETRİK FİLTRELEME + SEKME FİLTRESİ + KATEGORİ + ŞEHİR ---
  const filteredData = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase());

    const matchesTab = (job.serviceType || "Bull-Part") === activeTab;
    const matchesCategory = !filterCategory || job.category === filterCategory;
    const matchesCity = !filterCity || job.location?.toLowerCase().includes(filterCity.toLowerCase());

    if (USER_ROLE === "worker") {
      return matchesSearch && matchesTab && matchesCategory && matchesCity && job.type === "job_offer";
    } else {
      return matchesSearch && matchesTab && matchesCategory && matchesCity && job.type === "skill_profile";
    }
  });

  // Sıralama uygula
  const dynamicData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "priceAsc":
        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      case "priceDesc":
        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      case "ratingDesc":
        return (b.rating || 5) - (a.rating || 5);
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const activeFilterCount = (filterCategory ? 1 : 0) + (filterCity ? 1 : 0);

  const clearFilters = () => {
    setFilterCategory("");
    setFilterCity("");
  };

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

      {/* BULL PART / BULL LOJİSTİK SEKMELERİ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Bull-Part" && styles.activeTab]}
          onPress={() => setActiveTab("Bull-Part")}
          activeOpacity={0.8}
        >
          <Ionicons name="construct-outline" size={18} color={activeTab === "Bull-Part" ? "#FFF" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "Bull-Part" && styles.activeTabText]}>BULL PART</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Bull-Tır" && styles.activeTab]}
          onPress={() => setActiveTab("Bull-Tır")}
          activeOpacity={0.8}
        >
          <Ionicons name="bus-outline" size={18} color={activeTab === "Bull-Tır" ? "#FFF" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "Bull-Tır" && styles.activeTabText]}>BULL LOJİSTİK</Text>
        </TouchableOpacity>
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

      {/* SIRALA & FİLTRELE BUTONLARI */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical-outline" size={16} color="#003366" />
          <Text style={styles.actionBtnText}>
            Sırala: {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, activeFilterCount > 0 && styles.actionBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter-outline" size={16} color={activeFilterCount > 0 ? "#FFF" : "#003366"} />
          <Text style={[styles.actionBtnText, activeFilterCount > 0 && { color: "#FFF" }]}>
            Filtrele{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Text>
        </TouchableOpacity>
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

      {USER_ROLE === "employer" ? (
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

      {/* SIRALAMA MODALI */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sıralama Seçin</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalOption, sortBy === opt.key && styles.modalOptionActive]}
                onPress={() => { setSortBy(opt.key); setShowSortModal(false); }}
              >
                <Ionicons name={opt.icon} size={20} color={sortBy === opt.key ? "#003366" : "#64748B"} />
                <Text style={[styles.modalOptionText, sortBy === opt.key && styles.modalOptionTextActive]}>{opt.label}</Text>
                {sortBy === opt.key && <Ionicons name="checkmark-circle" size={20} color="#003366" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FİLTRE MODALI */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrele</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFilterText}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.filterSectionTitle}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
                  onPress={() => setFilterCategory("")}
                >
                  <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>Tümü</Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
                    onPress={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                  >
                    <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Şehir</Text>
            <View style={styles.filterCityInput}>
              <Ionicons name="location-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.filterCityText}
                placeholder="Şehir yazın (ör: İstanbul)"
                value={filterCity}
                onChangeText={setFilterCity}
                placeholderTextColor="#94A3B8"
              />
              {filterCity ? (
                <TouchableOpacity onPress={() => setFilterCity("")}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.filterApplyBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.filterApplyBtnText}>Uygula ({dynamicData.length} sonuç)</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20, paddingBottom: 10 },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  subTitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 11,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#003366",
    elevation: 3,
    shadowColor: "#003366",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
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
  actionRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: "#003366",
    borderColor: "#003366",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003366",
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    gap: 12,
  },
  modalOptionActive: {
    backgroundColor: "#F0F5FF",
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: "#475569",
  },
  modalOptionTextActive: {
    color: "#003366",
    fontWeight: "bold",
  },
  clearFilterText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#003366",
    borderColor: "#003366",
  },
  filterChipText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  filterCityInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    gap: 8,
  },
  filterCityText: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
  },
  filterApplyBtn: {
    backgroundColor: "#003366",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  filterApplyBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
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
