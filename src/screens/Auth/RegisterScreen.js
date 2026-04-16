import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE from '../../config/api';

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const SECTORS = [
  "Lojistik / Taşıma",
  "Depo / Antrepo",
  "İnşaat / Şantiye",
  "Temizlik",
  "Gıda / Üretim",
  "Kargo / Kurye",
  "Garson / Komi",
  "Satış / Pazarlama",
  "Bilişim / Yazılım",
  "Otomotiv / Sanayi",
  "Tekstil / Konfeksiyon",
  "Güvenlik",
  "Diğer"
];

export default function RegisterScreen({ navigation }) {
  // --- STATE YÖNETİMİ ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtsList, setDistrictsList] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districtInputMode, setDistrictInputMode] = useState(false);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [sectorSearch, setSectorSearch] = useState('');

  const [date, setDate] = useState(new Date(2000, 0, 1));
  
  const [form, setForm] = useState({
    tc: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    birthDate: '', 
    role: 'worker', 
    interests: '',
    region: ''
  });

  // --- FONKSİYONLAR ---
  const handleChange = (key, value) => {
    setForm(prev => ({ 
      ...prev, 
      [key]: value 
    }));
  };

  const openDistrictSelection = async () => {
    if (!form.city) {
      Alert.alert("Uyarı", "Lütfen önce bir şehir seçiniz.");
      return;
    }
    
    // API başarısız olduysa normal text inputa geçtik demektir, modal açma
    if (districtInputMode) return;

    setShowDistrictModal(true);
    
    // Zaten bu şehrin ilçeleri yüklüyse tekrar API'ye gitme
    if (districtsList.length > 0 && districtsList[0].city === form.city) return;

    setLoadingDistricts(true);
    setDistrictsList([]);
    try {
      const response = await axios.get(`https://turkiyeapi.dev/api/v1/provinces?name=${encodeURIComponent(form.city)}`);
      if (response.data?.data?.[0]?.districts) {
         let fetchedProps = response.data.data[0].districts.map(d => ({ name: d.name, city: form.city }));
         fetchedProps.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
         setDistrictsList(fetchedProps);
      } else {
         throw new Error("İlçeler bulunamadı");
      }
    } catch (error) {
      console.log("İlçe çekme hatası:", error);
      setShowDistrictModal(false);
      setDistrictInputMode(true); // Fallback: hata olursa veya internet yoksa klavyeyle yazsın
    } finally {
      setLoadingDistricts(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    // Sadece Android'de seçim yapıldığında hemen kapat
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setHours(12, 0, 0, 0); 
      setDate(adjustedDate);

      const day = String(adjustedDate.getDate()).padStart(2, '0');
      const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const year = adjustedDate.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;
      
      handleChange('birthDate', formattedDate);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleNextStep = () => {
    const { tc, name, surname, email, password, confirmPassword, city, birthDate } = form;
    if (!tc || !name || !surname || !email || !password || !city || !birthDate) {
      Alert.alert("Hata", "Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    if (tc.length !== 11) {
      Alert.alert("Hata", "TC Kimlik No tam 11 haneli olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler uyuşmuyor.");
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!form.region) {
      Alert.alert("Hata", "Lütfen bölge bilgisini giriniz.");
      return;
    }

    setLoading(true);
    try {
      const API_URL = `${API_BASE}/users/register`;
      const payload = {
        name: `${form.name} ${form.surname}`,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        birthDate: form.birthDate,
        city: form.city,
        region: form.region
      };

      const response = await axios.post(API_URL, payload);

      if (response.status === 201) {
        Alert.alert("Başarılı", "BULL dünyasına hoş geldin!");
        navigation.navigate('Login');
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Sunucu hatası.";
      Alert.alert("Kayıt Hatası", msg);
    } finally {
      setLoading(false);
    }
  };

  // --- ARAYÜZ ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bölümü */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? 'Kişisel Bilgiler' : 'Tercihler & Rol'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Adım 1 / 2' : 'Adım 2 / 2'}
            </Text>
          </View>

          {step === 1 ? (
            <View style={styles.formArea}>
              {/* İsim & Soyisim Satırı */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { marginRight: 10 }]}>
                  <Text style={styles.label}>İsim</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ad" 
                    value={form.name} 
                    onChangeText={(t) => handleChange('name', t)} 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Soyisim</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Soyad" 
                    value={form.surname} 
                    onChangeText={(t) => handleChange('surname', t)} 
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>TC Kimlik No</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="11 Haneli TC No" 
                  keyboardType="numeric" 
                  maxLength={11} 
                  value={form.tc} 
                  onChangeText={(t) => handleChange('tc', t)} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Doğum Tarihi</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(prev => !prev)}
                >
                  <Text style={[styles.dateText, !form.birthDate && styles.placeholderText]}>
                    {form.birthDate || "Tarih Seçiniz"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <View style={Platform.OS === 'ios' ? { backgroundColor: '#F6F4F0', borderRadius: 14, padding: 10, marginTop: -10, marginBottom: 15 } : null}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    textColor="#000000"
                    themeVariant="light"
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)}
                      style={{ alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30, backgroundColor: '#003366', borderRadius: 10, marginTop: 5 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Tamam</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-Posta</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="ornek@mail.com" 
                  autoCapitalize="none"
                  value={form.email} 
                  onChangeText={(t) => handleChange('email', t)} 
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { marginRight: 10 }]}>
                  <Text style={styles.label}>Şifre</Text>
                  <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    placeholder="******"
                    value={form.password} 
                    onChangeText={(t) => handleChange('password', t)} 
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tekrar</Text>
                  <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    placeholder="******"
                    value={form.confirmPassword} 
                    onChangeText={(t) => handleChange('confirmPassword', t)} 
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şehir</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowCityModal(true)}
                >
                  <Text style={[styles.dateText, !form.city && styles.placeholderText]}>
                    {form.city || "Şehir Seçiniz..."}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.mainButton} onPress={handleNextStep}>
                <Text style={styles.buttonText}>SONRAKİ ADIM</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formArea}>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profil Türü</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity 
                    style={[styles.roleBox, form.role === 'worker' && styles.roleBoxActive]}
                    onPress={() => handleChange('role', 'worker')}
                  >
                    <Text style={[styles.roleLabel, form.role === 'worker' && styles.roleLabelActive]}>İşçi (Yetenek Paylaş)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleBox, form.role === 'employer' && styles.roleBoxActive]}
                    onPress={() => handleChange('role', 'employer')}
                  >
                    <Text style={[styles.roleLabel, form.role === 'employer' && styles.roleLabelActive]}>İşveren (İlan Ver)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sektör / İlgi Alanı</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowSectorModal(true)}
                >
                  <Text style={[styles.dateText, !form.interests && styles.placeholderText]}>
                    {form.interests || "Sektör Seçiniz..."}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bölge / İlçe</Text>
                {!districtInputMode ? (
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={openDistrictSelection}
                  >
                    <Text style={[styles.dateText, !form.region && styles.placeholderText]}>
                      {form.region || "İlçe Seçiniz..."}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TextInput 
                    style={styles.input} 
                    placeholder="Örn: Kadıköy" 
                    value={form.region} 
                    onChangeText={(t) => handleChange('region', t)} 
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
                  <Text style={styles.secondaryButtonText}>GERİ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleRegister} 
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>KAYDI TAMAMLA</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>Zaten üye misiniz? <Text style={styles.boldText}>Giriş Yap</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Şehir Seçim Modalı */}
      <Modal visible={showCityModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>İl Seçiniz</Text>
                <TouchableOpacity onPress={() => setShowCityModal(false)}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput 
                style={styles.searchInput}
                placeholder="Şehir Ara..."
                value={citySearch}
                onChangeText={setCitySearch}
              />

            <FlatList
              data={CITIES.filter(c => c.toLocaleLowerCase('tr-TR').includes(citySearch.toLocaleLowerCase('tr-TR')))}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => {
                    if (form.city !== item) {
                      handleChange('region', ''); // Farklı şehir seçildiğinde ilçeyi sıfırla
                    }
                    handleChange('city', item);
                    setShowCityModal(false);
                    setCitySearch('');
                  }}
                >
                  <Text style={styles.cityItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* İlçe Seçim Modalı */}
      <Modal visible={showDistrictModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{form.city} İlçeleri</Text>
                <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput 
                style={styles.searchInput}
                placeholder="İlçe Ara..."
                value={districtSearch}
                onChangeText={setDistrictSearch}
              />

              {loadingDistricts ? (
                 <ActivityIndicator size="large" color="#003366" style={{ marginVertical: 30 }} />
              ) : (
                <FlatList
                  data={districtsList.filter(d => d.name.toLocaleLowerCase('tr-TR').includes(districtSearch.toLocaleLowerCase('tr-TR')))}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.cityItem}
                      onPress={() => {
                        handleChange('region', item.name);
                        setShowDistrictModal(false);
                        setDistrictSearch('');
                      }}
                    >
                      <Text style={styles.cityItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sektör Seçim Modalı */}
      <Modal visible={showSectorModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sektör Seçiniz</Text>
                <TouchableOpacity onPress={() => setShowSectorModal(false)}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput 
                style={styles.searchInput}
                placeholder="Sektör Ara..."
                value={sectorSearch}
                onChangeText={setSectorSearch}
              />

            <FlatList
              data={SECTORS.filter(s => s.toLocaleLowerCase('tr-TR').includes(sectorSearch.toLocaleLowerCase('tr-TR')))}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => {
                    handleChange('interests', item);
                    setShowSectorModal(false);
                    setSectorSearch('');
                  }}
                >
                  <Text style={styles.cityItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// --- CSS / STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F4F0',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1D21',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
    letterSpacing: 1,
    fontWeight: '600',
  },
  formArea: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
    paddingHorizontal: 16,
    color: '#1A1D21',
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dateButton: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 15,
    color: '#1A1D21',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#B8BEC7',
  },
  mainButton: {
    backgroundColor: '#28A745',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#1B7A30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleBox: {
    flex: 1,
    height: 55,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8E4DE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  roleBoxActive: {
    borderColor: '#003366',
    backgroundColor: '#003366',
  },
  roleLabel: {
    fontWeight: '700',
    color: '#6B7280',
    fontSize: 13,
  },
  roleLabelActive: {
    color: '#FFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A5568',
    fontWeight: '700',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#28A745',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B7A30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footerLink: {
    marginTop: 35,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  boldText: {
    color: '#003366',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D21',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#F6F4F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 15,
    fontSize: 15,
    fontWeight: '500',
  },
  cityItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1ED',
  },
  cityItemText: {
    fontSize: 16,
    color: '#1A1D21',
    fontWeight: '500',
  },
});