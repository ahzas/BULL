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
        <View style={styles.cardHeader}>
          <View style={styles.titleCol}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isCompleted ? "#DCFCE7" : "#DBEAFE" }]}>
            <Text style={[styles.statusText, { color: isCompleted ? "#166534" : "#1E40AF" }]}>
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

            {isCompleted && profileToShow && (
              <View style={[styles.infoRow, { marginTop: 6 }]}>
                <Ionicons name="person-circle-outline" size={16} color="#003366" />
                <Text style={[styles.infoText, { color: "#003366", fontWeight: "bold" }]}>
                  {profileName}{" "}
                  <Text style={{ fontWeight: "normal", color: "#64748B" }}>
                    (⭐{profileRating.toFixed(1)} - {profileRatingCount} Değerlendirme)
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
                <Ionicons name="star" color="#FFF" size={14} />
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
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>
            Aktif İlanlarım ({activeJobs?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <Text style={[styles.tabText, activeTab === "past" && styles.activeTabText]}>
            Geçmiş İşler ({pastJobs?.length || 0})
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

      {/* Puanlama Modalı */}
      <Modal visible={rateModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Gerçek Değerlendirme</Text>
                <TouchableOpacity onPress={() => setRateModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#EF4444" />
                </TouchableOpacity>
             </View>
             
             <Text style={{textAlign: 'center', marginBottom: 20, color: '#334155'}}>
                 İş başarıyla tamamlandı. Karşı tarafın platformdaki güvenilirlik puanını (yıldızını) belirlemek için lütfen 1 ile 5 arası bir puan verin:
             </Text>

             <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons 
                      name={star <= rating ? "star" : "star-outline"} 
                      size={40} 
                      color="#F59E0B" 
                    />
                  </TouchableOpacity>
                ))}
             </View>

             <View style={{ alignItems: 'center', marginBottom: 20 }}>
                 {rating > 0 && <Text style={{fontSize: 16, fontWeight: 'bold', color: '#F59E0B'}}>{rating} Yıldız</Text>}
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  tabContainer: {
    flexDirection: "row", marginHorizontal: 20, backgroundColor: "#E2E8F0",
    borderRadius: 12, padding: 4, marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#FFFFFF", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  activeTabText: { color: "#003366" },
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  jobCard: {
    backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#F1F5F9", elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", },
  titleCol: { flex: 1, paddingRight: 10 },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  companyName: { fontSize: 13, color: "#64748B", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  cardDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 13, color: "#64748B", marginLeft: 6 },
  rateButton: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B',
      paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start'
  },
  rateButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4},
  priceCol: { alignItems: "flex-end", justifyContent: "flex-end" },
  priceValue: { fontSize: 16, fontWeight: "bold", color: "#28A745" },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 15, color: "#94A3B8", fontSize: 14, textAlign: "center", },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: 'center' },
  modalContent: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, width: '90%', shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#003366", },
  starsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 15 },
  submitRateBtn: { backgroundColor: '#003366', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitRateText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' }
});
