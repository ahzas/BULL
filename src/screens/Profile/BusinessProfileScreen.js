import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react'; // useCallback eklendi
import API_BASE from '../../config/api';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';

export default function BusinessProfileScreen() {
    const { user } = useContext(AuthContext); 
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const [form, setForm] = useState({
        businessName: '',
        industry: '',
        address: '',
        taxNumber: '',
        description: ''
    });

    // 1. fetchBusiness fonksiyonu useCallback ile sabitlendi (Uyarı 1 Çözümü)
    const fetchBusiness = useCallback(async () => {
        try {
            const API_URL = `${API_BASE}/business/${user._id}`;
            const response = await axios.get(API_URL);
            if (response.data.success) {
                setBusiness(response.data.data);
            }
        } catch (error) {
            // 2. error değişkeni kullanıldı (Uyarı 2 Çözümü)
            console.error("İşletme getirme hatası:", error.message);
        } finally {
            setLoading(false);
        }
    }, [user._id]); // user._id değişirse fonksiyon yenilenir

    useEffect(() => {
        fetchBusiness();
    }, [fetchBusiness]); // fetchBusiness artık güvenli bir bağımlılık

    const handleAddBusiness = async () => {
        if (!form.businessName || !form.industry || !form.address) {
            Alert.alert("Hata", "Lütfen zorunlu alanları doldurun.");
            return;
        }

        try {
            setLoading(true);
            const API_URL = `${API_BASE}/business/add`;
            const response = await axios.post(API_URL, {
                ...form,
                ownerId: user._id
            });

            if (response.data.success) {
                Alert.alert("Başarılı", "İşletmeniz başarıyla kaydedildi.");
                setBusiness(response.data.data);
                setIsAdding(false);
            }
        } catch (error) {
            // 3. error değişkeni kullanıldı (Uyarı 3 Çözümü)
            console.error("İşletme kayıt hatası:", error);
            Alert.alert("Hata", "İşletme kaydedilemedi: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator 
                    size="large" 
                    color="#003366" 
                />
            </View>
        );
    }

    if (isAdding || !business) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.headerTitle}>İşletme Bilgileri</Text>
                    <Text style={styles.headerSub}>Sarp Gıda sistemine işletmenizi kaydedin.</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>İşletme Adı *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Sarp Gıda Ltd. Şti."
                            value={form.businessName}
                            onChangeText={(t) => setForm({...form, businessName: t})}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Sektör *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Gıda / Su Dağıtım"
                            value={form.industry}
                            onChangeText={(t) => setForm({...form, industry: t})}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Adres *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            placeholder="Tam adres bilgisi..."
                            value={form.address}
                            onChangeText={(t) => setForm({...form, address: t})}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.mainButton} 
                        onPress={handleAddBusiness}
                    >
                        <Text style={styles.buttonText}>İşletmeyi Kaydet</Text>
                    </TouchableOpacity>

                    {business && (
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={() => setIsAdding(false)}
                        >
                            <Text style={styles.cancelText}>Vazgeç</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.businessCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons 
                            name="business" 
                            size={40} 
                            color="#003366" 
                        />
                        <View style={styles.titleArea}>
                            <Text style={styles.businessTitle}>{business.businessName}</Text>
                            <Text style={styles.industryTag}>{business.industry}</Text>
                        </View>
                    </View>
                    <Text style={styles.addressText}>{business.address}</Text>
                </View>

                <Text style={styles.sectionTitle}>Temin Edilen İşçiler</Text>
                <Text style={styles.sectionSub}>Uygulama üzerinden çalıştığınız kişiler.</Text>

                {business.hiredWorkers && business.hiredWorkers.length > 0 ? (
                    business.hiredWorkers.map((worker) => (
                        <View 
                            key={worker._id} 
                            style={styles.workerItem}
                        >
                            <Ionicons 
                                name="person-circle" 
                                size={40} 
                                color="#64748B" 
                            />
                            <View style={styles.workerInfo}>
                                <Text style={styles.workerName}>{worker.name}</Text>
                                <Text style={styles.workerRating}>
                                    Puan: ⭐ {worker.rating ? worker.rating.toFixed(1) : "5.0"}
                                    <Text style={{ fontSize: 10, color: "#94A3B8" }}> ({worker.ratingCount || 0} Değerlendirme)</Text>
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.viewBtn}>
                                <Text style={styles.viewBtnText}>Detay</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Henüz bir işçi alımı yapmadınız.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F4F0',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A1D21',
    },
    headerSub: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 25,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1D21',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E4DE',
        borderRadius: 14,
        padding: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    mainButton: {
        backgroundColor: '#28A745',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    businessCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 18,
        shadowColor: '#1B2E4B',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 30,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    titleArea: {
        marginLeft: 15,
    },
    businessTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#003366',
    },
    industryTag: {
        color: '#64748B',
        fontSize: 14,
    },
    addressText: {
        color: '#475569',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1D21',
    },
    sectionSub: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 15,
    },
    workerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    workerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    workerName: {
        fontWeight: '700',
        color: '#1E293B',
    },
    workerRating: {
        fontSize: 12,
        color: '#28A745',
        marginTop: 2,
    },
    viewBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F1ED',
    },
    viewBtnText: {
        fontSize: 12,
        color: '#003366',
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
    },
    cancelButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    cancelText: {
        color: '#EF4444',
        fontWeight: '600',
    }
});