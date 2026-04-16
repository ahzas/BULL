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

  const categoryColor = item.serviceType === "Bull-Tır" ? "#E67E22" : "#28A745";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("JobDetail", { job: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.cardAccent, { backgroundColor: categoryColor }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfoContainer}>
            <View style={[styles.imageContainer, { borderColor: categoryColor + '30' }]}>
              {isUrl ? (
                <Image source={{ uri: imageVal }} style={styles.cardImage} />
              ) : (
                <Ionicons name={iconName} size={22} color={categoryColor} />
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.subText} numberOfLines={1}>{item.company}</Text>
            </View>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: '#FFF8E7' }]}>
            <Ionicons name="star" size={11} color="#E5A100" />
            <Text style={styles.ratingText}>{item.rating || "5.0"}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#8C95A3" />
            <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.price}>{item.price} ₺</Text>
          </View>
        </View>
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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>
              Merhaba, {user?.name ? user.name : "Vezir"} 👋
            </Text>
            <Text style={styles.subTitle}>
              {USER_ROLE === "worker"
                ? "Sana uygun en güncel işleri listeledik"
                : "İşletmen için en yetenekli personeller"}
            </Text>
          </View>
        </View>

        {/* ARAMA */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8C95A3" />
          <TextInput
            placeholder={
              USER_ROLE === "worker" ? "İş veya şirket ara..." : "Personel ara..."
            }
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#B8BEC7"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#B8BEC7" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* BULL PART / BULL LOJİSTİK SEKMELERİ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Bull-Part" && styles.activeTab]}
          onPress={() => setActiveTab("Bull-Part")}
          activeOpacity={0.8}
        >
          <Ionicons name="construct-outline" size={16} color={activeTab === "Bull-Part" ? "#FFF" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === "Bull-Part" && styles.activeTabText]}>BULL PART</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Bull-Tır" && styles.activeTabTir]}
          onPress={() => setActiveTab("Bull-Tır")}
          activeOpacity={0.8}
        >
          <Ionicons name="bus-outline" size={16} color={activeTab === "Bull-Tır" ? "#FFF" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === "Bull-Tır" && styles.activeTabText]}>BULL LOJİSTİK</Text>
        </TouchableOpacity>
      </View>

      {/* SIRALA & FİLTRELE BUTONLARI */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical-outline" size={15} color="#003366" />
          <Text style={styles.actionBtnText}>
            {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, activeFilterCount > 0 && styles.actionBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={15} color={activeFilterCount > 0 ? "#FFF" : "#003366"} />
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
        onRefresh={fetchJobs}
        refreshing={loading}
        ListEmptyComponent={() =>
          !loading && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search-outline" size={36} color="#B8BEC7" />
              </View>
              <Text style={styles.emptyTitle}>Henüz bir kayıt bulunamadı</Text>
              <Text style={styles.emptyText}>Filtreleri değiştirmeyi veya aşağıdan yeni ilan oluşturmayı deneyin.</Text>
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
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFF" />
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
                <View style={[styles.modalOptionIcon, sortBy === opt.key && { backgroundColor: '#003366' }]}>
                  <Ionicons name={opt.icon} size={18} color={sortBy === opt.key ? "#FFF" : "#6B7280"} />
                </View>
                <Text style={[styles.modalOptionText, sortBy === opt.key && styles.modalOptionTextActive]}>{opt.label}</Text>
                {sortBy === opt.key && <Ionicons name="checkmark" size={18} color="#003366" />}
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
                <TouchableOpacity onPress={clearFilters} style={styles.clearFilterBtn}>
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
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
              <Ionicons name="location-outline" size={18} color="#8C95A3" />
              <TextInput
                style={styles.filterCityText}
                placeholder="Şehir yazın (ör: İstanbul)"
                value={filterCity}
                onChangeText={setFilterCity}
                placeholderTextColor="#B8BEC7"
              />
              {filterCity ? (
                <TouchableOpacity onPress={() => setFilterCity("")}>
                  <Ionicons name="close-circle" size={18} color="#B8BEC7" />
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
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: { 
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTop: {
    marginBottom: 14,
  },
  welcomeText: { fontSize: 22, fontWeight: "800", color: "#1A1D21" },
  subTitle: { fontSize: 13, color: "#6B7280", marginTop: 3, fontWeight: "500" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F4F0",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#1A1D21", fontWeight: "500" },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#EDEAE4",
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 11,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#003366",
    shadowColor: "#003366",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  activeTabTir: {
    backgroundColor: "#E67E22",
    shadowColor: "#E67E22",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 8,
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
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionBtnActive: {
    backgroundColor: "#003366",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003366",
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDDAD4",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1D21",
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    gap: 12,
  },
  modalOptionActive: {
    backgroundColor: "#F0F5FF",
  },
  modalOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F1ED",
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: "#4A5568",
    fontWeight: "500",
  },
  modalOptionTextActive: {
    color: "#003366",
    fontWeight: "700",
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  clearFilterText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F1ED",
  },
  filterChipActive: {
    backgroundColor: "#003366",
  },
  filterChipText: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  filterCityInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F4F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 24,
    gap: 8,
  },
  filterCityText: {
    flex: 1,
    fontSize: 15,
    color: "#1A1D21",
  },
  filterApplyBtn: {
    backgroundColor: "#28A745",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  filterApplyBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  // KART
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfoContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F6F4F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  cardImage: { width: 44, height: 44, borderRadius: 12 },
  titleContainer: { marginLeft: 12, flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: "700", color: "#1A1D21" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    color: "#B8860B",
    fontSize: 12,
    fontWeight: "800",
  },
  subText: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },
  locationContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  location: { color: "#8C95A3", fontSize: 12, marginLeft: 4 },
  priceTag: {
    backgroundColor: "#E8F5EC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  price: { color: "#1B7A30", fontWeight: "800", fontSize: 14 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#003366",
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fabEmployer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#003366",
    borderRadius: 18,
    elevation: 10,
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
    backgroundColor: "rgba(255,255,255,0.12)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EDEAE4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { color: "#4A5568", fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptyText: { color: "#8C95A3", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
