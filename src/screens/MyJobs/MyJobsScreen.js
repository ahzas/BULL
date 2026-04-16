// src/screens/MyJobs/MyJobsScreen.js
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

import API_BASE from "../../config/api";

export default function MyJobsScreen() {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const userId = userData?._id || userData?.id;

  const [activeTab, setActiveTab] = useState("active");
  const [activeJobs, setActiveJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [selectedJobToRate, setSelectedJobToRate] = useState(null);
  const [rating, setRating] = useState(0);

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

  const handleRateSubmit = async () => {
    if (rating < 1) return Alert.alert("Hata", "Lütfen 1 ile 5 arasında bir puan seçin.");
    
    try {
      // Dinamik olarak ilanın sahibi biz miyiz diye kontrol ederek oylayacağımız kişiyi seçeceğiz
      const isOwner = selectedJobToRate.ownerId?._id === userId || selectedJobToRate.ownerId === userId;
      
      const targetUserId = isOwner 
          ? (selectedJobToRate.assignedTo?._id || selectedJobToRate.assignedTo)
          : (selectedJobToRate.ownerId?._id || selectedJobToRate.ownerId);

      if (!targetUserId) {
         return Alert.alert("Hata", "Oylanacak kullanıcı bulunamadı.");
      }

      await axios.post(`${API_BASE}/jobs/${selectedJobToRate._id}/rate`, {
         targetUserId: targetUserId,
         ratingValue: rating,
         role: isOwner ? "employer" : "worker"
      });

      Alert.alert("Başarılı", "Gerçek değerlendirmeniz sisteme kaydedildi! Teşekkürler.");
      setRateModalVisible(false);
      fetchJobs(); // Tabloyu yenileyerek butonun gitmesini sağla
    } catch (e) {
      Alert.alert("Hata", e.response?.data?.message || "Puanlama sırasında bir hata oluştu.");
    }
  };

  const renderJobItem = ({ item }) => {
    const isCompleted = item.status === "completed";
    
    // İşveren (İlan Sahibi) miyiz? Bunu State'den değil işin verisinden kesin olarak doğruluyoruz.
    const isOwner = item.ownerId?._id === userId || item.ownerId === userId;
    
    // Bize Gözükecek Profil (İşverensek işçiyi, işçiysek işvereni gösteririz)
    const profileToShow = isOwner ? item.assignedTo : item.ownerId;
    const profileName = profileToShow?.name || profileToShow?.company || null;
    const profileRating = profileToShow?.rating || 5.0;
    const profileRatingCount = profileToShow?.ratingCount || 0;

    // Oy verebilir mi? (Eğer ilan sahibiysek employerRated, işçiysek workerRated işaretlerine bakarız)
    const canRate = isCompleted && (isOwner ? !item.employerRated : !item.workerRated);

    const rawDate = isCompleted ? item.completedAt || item.createdAt : item.createdAt;
    const dateObj = new Date(rawDate);
    const dateStr = dateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", });

    return (
      <View style={styles.jobCard}>
        <View style={[styles.cardLeftBorder, { backgroundColor: isCompleted ? "#28A745" : "#003366" }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleCol}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.companyName}>{item.company}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isCompleted ? "#E8F5EC" : "#EEF2FF" }]}>
              <View style={[styles.statusDot, { backgroundColor: isCompleted ? "#28A745" : "#003366" }]} />
              <Text style={[styles.statusText, { color: isCompleted ? "#1B7A30" : "#003366" }]}>
                {isCompleted ? "Tamamlandı" : "Aktif"}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={{ flex: 1 }}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={15} color="#8C95A3" />
                <Text style={styles.infoText}>{dateStr}</Text>
              </View>

              {isCompleted && profileToShow && (
                <View style={[styles.infoRow, { marginTop: 6 }]}>
                  <Ionicons name="person-circle-outline" size={15} color="#003366" />
                  <Text style={[styles.infoText, { color: "#003366", fontWeight: "700" }]}>
                    {profileName}{" "}
                    <Text style={{ fontWeight: "normal", color: "#8C95A3" }}>
                      (⭐{profileRating.toFixed(1)} - {profileRatingCount})
                    </Text>
                  </Text>
                </View>
              )}

              {canRate && (
                <TouchableOpacity 
                  style={styles.rateButton} 
                  onPress={() => {
                    setSelectedJobToRate(item);
                    setRating(0);
                    setRateModalVisible(true);
                  }}
                >
                  <Ionicons name="star" color="#FFF" size={13} />
                  <Text style={styles.rateButtonText}>
                     {isOwner ? "İşçiyi Puanla" : "İşvereni Puanla"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.priceCol}>
              <Text style={styles.priceValue}>{item.price} ₺</Text>
            </View>
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <View style={[styles.tabDot, activeTab === "active" && { backgroundColor: '#003366' }]} />
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>
            Aktif ({activeJobs?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <View style={[styles.tabDot, activeTab === "past" && { backgroundColor: '#28A745' }]} />
          <Text style={[styles.tabText, activeTab === "past" && styles.activeTabText]}>
            Geçmiş ({pastJobs?.length || 0})
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
          keyExtractor={(item, index) => item._id?.toString() || index.toString()}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003366"]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="briefcase-outline" size={40} color="#B8BEC7" />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === "active"
                  ? "Aktif ilanınız yok"
                  : "Geçmiş işiniz yok"}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === "active"
                  ? "Henüz aktif bir ilanınız bulunmuyor."
                  : "Tamamlanmış geçmiş bir işiniz yok."}
              </Text>
            </View>
          }
        />
      )}

      {/* Puanlama Modalı */}
      <Modal visible={rateModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Değerlendirme</Text>
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setRateModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
             </View>
             
             <Text style={styles.modalDesc}>
                 İş başarıyla tamamlandı. Karşı tarafın platformdaki güvenilirlik puanını belirlemek için lütfen 1 ile 5 arası puan verin:
             </Text>

             <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons 
                      name={star <= rating ? "star" : "star-outline"} 
                      size={40} 
                      color="#E5A100" 
                    />
                  </TouchableOpacity>
                ))}
             </View>

             <View style={{ alignItems: 'center', marginBottom: 20 }}>
                 {rating > 0 && <Text style={styles.starLabel}>{rating} Yıldız</Text>}
             </View>

             <TouchableOpacity style={styles.submitRateBtn} onPress={handleRateSubmit}>
                 <Text style={styles.submitRateText}>PUANI GÖNDER</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#1A1D21" },
  tabContainer: {
    flexDirection: "row", marginHorizontal: 20, backgroundColor: "#EDEAE4",
    borderRadius: 14, padding: 4, marginBottom: 16,
  },
  tab: { 
    flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 11,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  activeTab: { 
    backgroundColor: "#FFFFFF", 
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 2, 
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B8BEC7',
  },
  tabText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  activeTabText: { color: "#1A1D21" },
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  jobCard: {
    backgroundColor: "#FFF", borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: "#1B2E4B", shadowOpacity: 0.03, shadowRadius: 8,
    elevation: 1,
  },
  cardLeftBorder: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", },
  titleCol: { flex: 1, paddingRight: 10 },
  jobTitle: { fontSize: 15, fontWeight: "700", color: "#1A1D21" },
  companyName: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 5,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardDivider: { height: 1, backgroundColor: "#F3F1ED", marginVertical: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 13, color: "#6B7280", marginLeft: 6 },
  rateButton: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5A100',
      paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, marginTop: 10, alignSelf: 'flex-start',
      gap: 5,
  },
  rateButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  priceCol: { alignItems: "flex-end", justifyContent: "flex-end" },
  priceValue: { fontSize: 16, fontWeight: "800", color: "#1B7A30" },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#EDEAE4',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#4A5568", marginBottom: 6 },
  emptyText: { color: "#8C95A3", fontSize: 14, textAlign: "center", lineHeight: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: 'center' },
  modalContent: { 
    backgroundColor: "#FFF", borderRadius: 24, padding: 24, width: '90%', 
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1A1D21", },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
  },
  modalDesc: {
    textAlign: 'center', marginBottom: 24, color: '#4A5568', lineHeight: 20, fontSize: 14,
  },
  starsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 },
  starLabel: { fontSize: 16, fontWeight: '800', color: '#E5A100' },
  submitRateBtn: { backgroundColor: '#003366', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  submitRateText: { color: '#FFF', fontSize: 15, fontWeight: '800' }
});
