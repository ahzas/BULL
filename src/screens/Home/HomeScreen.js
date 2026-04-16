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

const JobCard = ({ item, navigation }) => {
  const imageVal = item.image;
  const isUrl = typeof imageVal === "string" && imageVal.startsWith("http");
  const iconName = imageVal && typeof imageVal === "string" && imageVal.length > 0 ? imageVal : "briefcase-outline";
  const isTir = item.serviceType === "Bull-Tır";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("JobDetail", { job: item })}
      activeOpacity={0.6}
    >
      {/* Sol ikon */}
      <View style={[styles.cardIcon, isTir && { backgroundColor: '#FFF3E0' }]}>
        {isUrl ? (
          <Image source={{ uri: imageVal }} style={{ width: 36, height: 36, borderRadius: 8 }} />
        ) : (
          <Ionicons name={iconName} size={22} color={isTir ? "#E67E22" : "#003366"} />
        )}
      </View>

      {/* Orta bilgi */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardCompany} numberOfLines={1}>{item.company}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={12} color="#999" />
          <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
        </View>
      </View>

      {/* Sağ fiyat */}
      <View style={styles.cardRight}>
        <Text style={styles.cardPrice}>{item.price} ₺</Text>
        <View style={styles.cardRating}>
          <Ionicons name="star" size={11} color="#F5A623" />
          <Text style={styles.cardRatingText}>{item.rating || "5.0"}</Text>
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

  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const CATEGORIES = [
    "Bilişim ve Teknoloji (IT)", "Satış ve Pazarlama", "Üretim ve Endüstri",
    "Lojistik ve Taşımacılık", "Hizmet ve Turizm", "Yönetim ve İdari İşler", "Diğer",
  ];

  const SORT_OPTIONS = [
    { key: "newest", label: "En Yeni" },
    { key: "oldest", label: "En Eski" },
    { key: "priceDesc", label: "Fiyat (Yüksek → Düşük)" },
    { key: "priceAsc", label: "Fiyat (Düşük → Yüksek)" },
    { key: "ratingDesc", label: "Puan (En Yüksek)" },
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

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filteredData = jobs.filter((job) => {
    const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase()) || job.company?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = (job.serviceType || "Bull-Part") === activeTab;
    const matchesCategory = !filterCategory || job.category === filterCategory;
    const matchesCity = !filterCity || job.location?.toLowerCase().includes(filterCity.toLowerCase());
    if (USER_ROLE === "worker") return matchesSearch && matchesTab && matchesCategory && matchesCity && job.type === "job_offer";
    else return matchesSearch && matchesTab && matchesCategory && matchesCity && job.type === "skill_profile";
  });

  const dynamicData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
      case "priceAsc": return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      case "priceDesc": return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      case "ratingDesc": return (b.rating || 5) - (a.rating || 5);
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const activeFilterCount = (filterCategory ? 1 : 0) + (filterCity ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../../assets/images/bull-logo.png')} style={styles.headerIcon} />
          <Text style={styles.headerLogo}>BULL</Text>
        </View>
        <Text style={styles.headerSub}>
          {USER_ROLE === "worker" ? "İş Bul" : "Personel Bul"}
        </Text>
      </View>

      {/* ARAMA */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder={USER_ROLE === "worker" ? "İş veya şirket ara..." : "Personel ara..."}
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* SEKMELER */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Bull-Part" && styles.tabActive]}
          onPress={() => setActiveTab("Bull-Part")}
        >
          <Text style={[styles.tabText, activeTab === "Bull-Part" && styles.tabTextActive]}>Bull Part</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Bull-Tır" && styles.tabActive]}
          onPress={() => setActiveTab("Bull-Tır")}
        >
          <Text style={[styles.tabText, activeTab === "Bull-Tır" && styles.tabTextActive]}>Bull Lojistik</Text>
        </TouchableOpacity>
      </View>

      {/* SIRALA / FİLTRE */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical" size={14} color="#003366" />
          <Text style={styles.filterBtnText}>{SORT_OPTIONS.find(o => o.key === sortBy)?.label}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={14} color={activeFilterCount > 0 ? "#FFF" : "#003366"} />
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && { color: "#FFF" }]}>
            Filtre{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Text>
        </TouchableOpacity>
        <Text style={styles.resultCount}>{dynamicData.length} sonuç</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#003366" style={{ marginTop: 20 }} />}

      {/* LİSTE */}
      <FlatList
        data={dynamicData}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => <JobCard item={item} navigation={navigation} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        onRefresh={fetchJobs}
        refreshing={loading}
        ListEmptyComponent={() => !loading && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#ddd" />
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyText}>Filtreleri değiştirin veya yeni ilan oluşturun.</Text>
          </View>
        )}
      />

      {/* FAB */}
      {USER_ROLE === "employer" ? (
        <TouchableOpacity style={styles.fabWide} onPress={() => navigation.navigate("PostJob")} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={22} color="#FFF" />
          <Text style={styles.fabWideText}>İlan Yayınla</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("PostJob")} activeOpacity={0.8}>
          <Ionicons name="add" size={26} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* SIRALAMA MODALI */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sıralama</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sheetOption, sortBy === opt.key && styles.sheetOptionActive]}
                onPress={() => { setSortBy(opt.key); setShowSortModal(false); }}
              >
                <Text style={[styles.sheetOptionText, sortBy === opt.key && { color: '#003366', fontWeight: '700' }]}>{opt.label}</Text>
                {sortBy === opt.key && <Ionicons name="checkmark" size={18} color="#003366" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FİLTRE MODALI */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sheetTitle}>Filtre</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity onPress={() => { setFilterCategory(""); setFilterCity(""); }}>
                  <Text style={{ color: '#E53935', fontSize: 14, fontWeight: '600' }}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.filterLabel}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.chip, !filterCategory && styles.chipActive]}
                  onPress={() => setFilterCategory("")}
                >
                  <Text style={[styles.chipText, !filterCategory && styles.chipTextActive]}>Tümü</Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, filterCategory === cat && styles.chipActive]}
                    onPress={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                  >
                    <Text style={[styles.chipText, filterCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.filterLabel}>Şehir</Text>
            <View style={styles.filterInput}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#333' }}
                placeholder="Şehir yazın (ör: İstanbul)"
                value={filterCity}
                onChangeText={setFilterCity}
                placeholderTextColor="#bbb"
              />
            </View>

            <TouchableOpacity style={styles.filterApply} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.filterApplyText}>Uygula ({dynamicData.length} sonuç)</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  // HEADER
  header: {
    backgroundColor: "#003366",
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerIcon: { width: 34, height: 34, borderRadius: 6 },
  headerLogo: { fontSize: 22, fontWeight: "900", color: "#FFF", letterSpacing: 2, marginLeft: 6 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  // ARAMA
  searchBar: {
    flexDirection: "row", alignItems: "center",
    margin: 12, marginBottom: 8,
    paddingHorizontal: 12, height: 42,
    backgroundColor: "#F5F5F5", borderRadius: 8,
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: "#333" },
  // SEKMELER
  tabs: { flexDirection: "row", marginHorizontal: 12, marginBottom: 8 },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: "#28A745" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#999" },
  tabTextActive: { color: "#28A745" },
  // FİLTRE ROW
  filterRow: { flexDirection: "row", paddingHorizontal: 12, marginBottom: 6, alignItems: 'center', gap: 8 },
  filterBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#DDD', borderRadius: 6,
  },
  filterBtnActive: { backgroundColor: '#003366', borderColor: '#003366' },
  filterBtnText: { fontSize: 12, fontWeight: "600", color: "#003366" },
  resultCount: { marginLeft: 'auto', fontSize: 12, color: '#999' },
  // KART
  card: {
    flexDirection: "row", alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: "#F0F4FF",
    justifyContent: "center", alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#222" },
  cardCompany: { fontSize: 13, color: "#777", marginTop: 2 },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 3 },
  cardLocation: { fontSize: 12, color: "#999" },
  cardRight: { alignItems: "flex-end", marginLeft: 8 },
  cardPrice: { fontSize: 16, fontWeight: "700", color: "#2E7D32" },
  cardRating: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  cardRatingText: { fontSize: 12, color: "#999", fontWeight: '600' },
  // FAB
  fab: {
    position: "absolute", bottom: 20, right: 16,
    backgroundColor: "#28A745", width: 52, height: 52, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  fabWide: {
    position: "absolute", bottom: 20, left: 16, right: 16,
    backgroundColor: "#28A745", borderRadius: 10, height: 50,
    flexDirection: 'row', justifyContent: "center", alignItems: "center", gap: 8,
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  fabWideText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  // MODAL
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 36 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDD", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 16 },
  sheetOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  sheetOptionActive: { backgroundColor: '#F0F4FF' },
  sheetOptionText: { fontSize: 15, color: '#555' },
  filterLabel: { fontSize: 13, fontWeight: "700", color: "#666", marginBottom: 8, textTransform: 'uppercase' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEE' },
  chipActive: { backgroundColor: '#003366', borderColor: '#003366' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  filterInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12, height: 44, justifyContent: 'center', marginBottom: 20 },
  filterApply: { backgroundColor: '#003366', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  filterApplyText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  // BOŞ
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { color: "#666", fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptyText: { color: "#999", fontSize: 14, textAlign: "center", marginTop: 4 },
});
