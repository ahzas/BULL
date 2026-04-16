import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

// Yardımcı Fonksiyon (Yaş Hesaplama)
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
        <View style={styles.jobBadge}>
          <Ionicons name="briefcase" size={14} color="#003366" />
          <Text style={styles.jobBadgeText} numberOfLines={1}>{item.jobTitle}</Text>
          <Text style={styles.jobPrice}>{item.jobPrice} ₺</Text>
        </View>
  
        <View style={styles.workerRow}>
          <View style={styles.avatarBox}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.workerName}>{worker.name || "İsimsiz"}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.infoText}>{worker.rating?.toFixed(1) || "5.0"}<Text style={styles.infoSub}> ({worker.ratingCount || 0})</Text></Text>
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
                <Text style={styles.infoText}>{[worker.region, worker.city].filter(Boolean).join(", ")}</Text>
              </View>
            )}
          </View>
        </View>
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

export default function EmployerProfileScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const userData = user?.user || user;
    const userId = userData?._id || userData?.id;

    const [activeTab, setActiveTab] = useState('işletmem'); // işletmem | çalışanlarım

    // -- İŞLETME STATE --
    const [businessLoading, setBusinessLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    const [isAddingBusiness, setIsAddingBusiness] = useState(false);
    const [businessForm, setBusinessForm] = useState({
        businessName: '', industry: '', address: '', taxNumber: '', description: ''
    });

    // -- ÇALIŞANLAR STATE --
    const [workers, setWorkers] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // -- İŞLETME METOTLARI --
    const fetchBusiness = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${API_BASE}/business/${userId}`);
            if (response.data.success) {
                setBusiness(response.data.data);
            }
        } catch (error) {
            console.log("İşletme getirme hatası:", error.message);
        } finally {
            setBusinessLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBusiness();
    }, [fetchBusiness]);

    const handleAddBusiness = async () => {
        if (!businessForm.businessName || !businessForm.industry || !businessForm.address) {
            Alert.alert("Hata", "Lütfen zorunlu alanları doldurun.");
            return;
        }
        try {
            setBusinessLoading(true);
            const response = await axios.post(`${API_BASE}/business/add`, {
                ...businessForm,
                ownerId: userId
            });
            if (response.data.success) {
                Alert.alert("Başarılı", "İşletmeniz başarıyla kaydedildi.");
                setBusiness(response.data.data);
                setIsAddingBusiness(false);
            }
        } catch (error) {
            console.error("İşletme kayıt hatası:", error);
            Alert.alert("Hata", "İşletme kaydedilemedi: " + (error.response?.data?.message || error.message));
        } finally {
            setBusinessLoading(false);
        }
    };

    // -- ÇALIŞANLAR METOTLARI --
    const fetchActiveWorkers = async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${API_BASE}/jobs/active-workers/${userId}`);
            setWorkers(response.data || []);
        } catch (error) {
            console.log("Aktif çalışan çekme hatası:", error.message);
        } finally {
            setWorkersLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'çalışanlarım') {
                setWorkersLoading(true);
                fetchActiveWorkers();
            }
        }, [userId, activeTab])
    );

    const onRefreshWorkers = () => {
        setRefreshing(true);
        fetchActiveWorkers();
    };

    // -- RENDER İŞLETME SEKME --
    const renderBusinessTab = () => {
        if (businessLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#003366" /></View>;

        if (isAddingBusiness || !business) {
            return (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitleSec}>İşletme Bilgileri</Text>
                    <Text style={styles.headerSubSec}>Sistemde işletmenizi kaydedin.</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>İşletme Adı *</Text>
                        <TextInput style={styles.input} placeholder="Örn: Sarp Gıda Ltd. Şti." value={businessForm.businessName} onChangeText={t => setBusinessForm({...businessForm, businessName: t})} />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Sektör *</Text>
                        <TextInput style={styles.input} placeholder="Örn: Gıda / Su Dağıtım" value={businessForm.industry} onChangeText={t => setBusinessForm({...businessForm, industry: t})} />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Adres *</Text>
                        <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Tam adres bilgisi..." value={businessForm.address} onChangeText={t => setBusinessForm({...businessForm, address: t})} />
                    </View>
                    <TouchableOpacity style={styles.mainButton} onPress={handleAddBusiness}>
                        <Text style={styles.buttonText}>İşletmeyi Kaydet</Text>
                    </TouchableOpacity>
                    {business && (
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddingBusiness(false)}>
                            <Text style={styles.cancelText}>Vazgeç</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            );
        }

        return (
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.businessCard, { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="business" size={40} color="#4F46E5" />
                        <View style={styles.titleArea}>
                            <Text style={styles.businessTitle}>{business.businessName}</Text>
                            <Text style={styles.industryTag}>{business.industry}</Text>
                        </View>
                    </View>
                    <Text style={styles.addressText}>{business.address}</Text>
                    <TouchableOpacity style={styles.editBtn} onPress={() => setIsAddingBusiness(true)}>
                        <Ionicons name="pencil" size={14} color="#FFF"/>
                        <Text style={styles.editBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {/* Ekranda boş kalmasın diye kısa bir bilgilendirme */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={24} color="#0284C7" />
                    <Text style={styles.infoBannerText}>
                        Resmi işletme bilgileriniz BULL platformundaki vergilendirme süreçlerinde kullanılmaktadır.
                    </Text>
                </View>
            </ScrollView>
        );
    };

    // -- RENDER ÇALIŞANLAR SEKME --
    const renderWorkersTab = () => {
        if (workersLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#003366" /></View>;

        return (
            <FlatList
                data={workers}
                keyExtractor={(item, index) => item.jobId?.toString() || index.toString()}
                renderItem={({ item }) => <WorkerCard item={item} />}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshWorkers} colors={["#003366"]} />}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="people-outline" size={70} color="#E2E8F0" />
                        <Text style={styles.emptyTitle}>Henüz Aktif Çalışan Yok</Text>
                        <Text style={styles.emptyText}>
                            Bir iş ilanınıza başvuran işçiyi işe aldığınızda burada görünecektir.
                            İş tamamlandığında liste sıfırlanır.
                        </Text>
                    </View>
                }
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* ÜST BİLGİ ALANI */}
            <View style={styles.headerArea}>
                <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İşveren Paneli</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* SEKMELER */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'işletmem' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('işletmem')}
                >
                    <Ionicons name="business" size={20} color={activeTab === 'işletmem' ? '#003366' : '#94A3B8'} style={styles.tabIcon} />
                    <Text style={[styles.tabText, activeTab === 'işletmem' && styles.tabTextActive]}>İşletmem</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'çalışanlarım' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('çalışanlarım')}
                >
                    <Ionicons name="people" size={20} color={activeTab === 'çalışanlarım' ? '#003366' : '#94A3B8'} style={styles.tabIcon} />
                    <Text style={[styles.tabText, activeTab === 'çalışanlarım' && styles.tabTextActive]}>Mevcut Personel</Text>
                </TouchableOpacity>
            </View>

            {/* İÇERİK ALANI */}
            <View style={styles.contentArea}>
                {activeTab === 'işletmem' ? renderBusinessTab() : renderWorkersTab()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    headerArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#FFF' },
    headerBackBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    
    tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabButtonActive: { borderBottomColor: '#003366' },
    tabIcon: { marginRight: 8 },
    tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
    tabTextActive: { color: '#003366', fontWeight: 'bold' },
    contentArea: { flex: 1 },

    scrollContent: { padding: 20 },
    headerTitleSec: { fontSize: 24, fontWeight: '900', color: '#003366' },
    headerSubSec: { fontSize: 14, color: '#64748B', marginBottom: 25, marginTop: 4 },
    formGroup: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 15, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    mainButton: { backgroundColor: '#003366', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    cancelButton: { marginTop: 15, alignItems: 'center' },
    cancelText: { color: '#EF4444', fontWeight: '600', padding: 10 },
    
    businessCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    titleArea: { marginLeft: 15, flex: 1 },
    businessTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    industryTag: { color: '#64748B', fontSize: 13, marginTop: 2 },
    addressText: { color: '#475569', lineHeight: 20, fontSize: 13 },
    editBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 15 },
    editBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

    infoBanner: { flexDirection: 'row', backgroundColor: '#E0F2FE', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BAE6FD' },
    infoBannerText: { flex: 1, marginLeft: 12, color: '#0369A1', fontSize: 12, lineHeight: 18 },

    // Worker Card Styles
    listContent: { padding: 20 },
    card: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8 },
    jobBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F5FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 14, gap: 6 },
    jobBadgeText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#003366" },
    jobPrice: { fontSize: 14, fontWeight: "bold", color: "#28A745" },
    workerRow: { flexDirection: "row", gap: 14 },
    avatarBox: { position: "relative" },
    avatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#F1F5F9", borderWidth: 2, borderColor: "#E2E8F0" },
    onlineDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#28A745", borderWidth: 2, borderColor: "#FFF" },
    infoCol: { flex: 1, gap: 5 },
    workerName: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 2 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    infoText: { fontSize: 13, color: "#475569" },
    infoSub: { fontSize: 11, color: "#94A3B8" },
    jobFooter: { flexDirection: "row", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", gap: 16 },
    jobFooterItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    jobFooterText: { fontSize: 12, color: "#94A3B8" },
    
    emptyBox: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#64748B", marginTop: 16 },
    emptyText: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginTop: 8, lineHeight: 20 },
});
