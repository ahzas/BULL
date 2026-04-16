import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { useContext, useState } from "react";
import {
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
  FlatList,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { JobContext } from "../../context/JobContext";
import {
  calculateEmployerPreview,
  calculateWorkerPreview,
  getCommissionTier,
} from "../../utils/commission";
import API_BASE from "../../config/api";

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const VEHICLE_TYPES = ["Tenteli", "Açık Kasa", "Frigo - Soğutuculu", "Kamyon", "Kırkayak", "Panelvan", "Lowbed", "Diğer"];
const PRODUCT_TYPES = ["Paletli Yük", "Dökme Yük", "Kuru Yük", "Ev Eşyası / Nakliye", "Tehlikeli Madde (ADR)", "Diğer"];

const CATEGORY_ICONS = {
  "Bilişim ve Teknoloji (IT)": "code-working-outline",
  "Satış ve Pazarlama": "trending-up-outline",
  "Üretim ve Endüstri": "settings-outline",
  "Lojistik ve Taşımacılık": "truck-outline",
  "Hizmet ve Turizm": "people-outline",
  "Yönetim ve İdari İşler": "briefcase-outline",
  Diğer: "ellipsis-horizontal-outline",
};

const CATEGORY_DATA = {
  "Bilişim ve Teknoloji (IT)": ["Yazılım Geliştirme", "Veri Bilimi", "Siber Güvenlik", "IT Destek", "Sistem Yönetimi"],
  "Satış ve Pazarlama": ["Saha Satış", "Dijital Pazarlama", "CRM Yönetimi", "E-ticaret", "Marka Yönetimi"],
  "Üretim ve Endüstri": ["Fabrika İşçisi", "Kalite Kontrol", "Depo Yönetimi", "Makine Operatörü", "Bakım"],
  "Lojistik ve Taşımacılık": ["Kurye", "Şoför", "Tedarik Zinciri", "Sevkiyat"],
  "Hizmet ve Turizm": ["Restoran / Kafe", "Otel ve Konaklama", "Temizlik", "Güvenlik"],
  "Yönetim ve İdari İşler": ["İnsan Kaynakları", "Muhasebe", "Sekreterya", "Hukuk"],
  Diğer: ["Diğer"],
};

export default function PostJobScreen({ navigation }) {
  const { addJob } = useContext(JobContext);
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const USER_ROLE = userData?.role === "employer" ? "employer" : "worker";
  const streakDays = userData?.streak || 0;

  const API_URL = `${API_BASE}/jobs`;

  const [step, setStep] = useState(1);
  const [showCityModal, setShowCityModal] = useState({ visible: false, type: "" });
  const [citySearch, setCitySearch] = useState("");
  
  const [showDistrictModal, setShowDistrictModal] = useState({ visible: false, type: "", cityContext: "" });
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtsList, setDistrictsList] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [showDropdownModal, setShowDropdownModal] = useState({ visible: false, type: "", data: [] });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const [form, setForm] = useState({
    title: "",
    company: "",
    price: "",
    location: "",
    description: "",
    category: "",
    subCategory: "",
    serviceType: "Bull-Part",
    // Bull-Tır Özel:
    fromCity: "",
    fromDistrict: "",
    fromAddressDetail: "",
    toCity: "",
    toDistrict: "",
    toAddressDetail: "",
    tonnage: "",
    productType: "",
    vehicleType: "",
    loadingDate: "",
    contractApproved: false
  });

  const openDistrictSelection = async (type) => {
    const cityContext = type === "from" ? form.fromCity : form.toCity;
    if (!cityContext) {
      Alert.alert("Uyarı", "Lütfen önce bir şehir seçiniz.");
      return;
    }

    setShowDistrictModal({ visible: true, type, cityContext });

    if (districtsList.length > 0 && districtsList[0].city === cityContext) return;

    setLoadingDistricts(true);
    setDistrictsList([]);
    try {
      const response = await axios.get(`https://turkiyeapi.dev/api/v1/provinces?name=${encodeURIComponent(cityContext)}`);
      if (response.data?.data?.[0]?.districts) {
         let fetchedProps = response.data.data[0].districts.map(d => ({ name: d.name, city: cityContext }));
         fetchedProps.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
         setDistrictsList(fetchedProps);
      } else {
         throw new Error("İlçeler bulunamadı");
      }
    } catch (error) {
      console.log("İlçe çekme hatası:", error);
      setDistrictsList([{name: "Merkez", city: cityContext}, {name: "Diğer", city: cityContext}]); 
    } finally {
      setLoadingDistricts(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
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
      
      setForm({...form, loadingDate: formattedDate});
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
        if (form.serviceType === "Bull-Tır") setStep(2);
        else setStep(4);
    } else if (step === 2) {
        if (!form.fromCity || !form.fromDistrict || !form.fromAddressDetail) {
            Alert.alert("Eksik", "Lütfen tüm 'Nereden' bilgilerini doldurun."); return;
        }
        setStep(3);
    } else if (step === 3) {
        if (!form.toCity || !form.toDistrict || !form.toAddressDetail) {
            Alert.alert("Eksik", "Lütfen tüm 'Nereye' bilgilerini doldurun."); return;
        }
        setStep(4);
    } else if (step === 4) {
        if (!form.title || !form.company || !form.price || !form.category) {
            Alert.alert("Eksik", "Lütfen ilan/yetenek başlığını, firma/isim bilgisini, fiyat ve kategoriyi doldurun."); return;
        }
        if (form.serviceType === "Bull-Tır") {
            if(!form.vehicleType || !form.productType || !form.tonnage || !form.loadingDate) {
                Alert.alert("Eksik", "Lütfen lojistik (tonaj, araç tipi vb.) detaylarını tam doldurun."); return;
            }
            setStep(5);
        } else {
            handlePublish();
        }
    }
  };

  const handlePublish = async () => {
    const isTir = form.serviceType === "Bull-Tır" && USER_ROLE === "employer";
    
    if (isTir && !form.contractApproved) {
        Alert.alert("Hata", "Lütfen Mesafeli Taşıma Sözleşmesini onaylayınız.");
        return;
    }

    const finalFromLoc = isTir ? `${form.fromCity} - ${form.fromDistrict} - ${form.fromAddressDetail}` : "";
    const finalToLoc = isTir ? `${form.toCity} - ${form.toDistrict} - ${form.toAddressDetail}` : "";

    const payloadForm = {
      ...form,
      fromLocation: finalFromLoc,
      toLocation: finalToLoc
    };

    try {
      let coords = {};
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (locErr) {
        console.log("Konum alınamadı:", locErr.message);
      }

      const response = await axios.post(API_URL, {
        ...payloadForm,
        ...coords,
        image: CATEGORY_ICONS[form.category] || "briefcase-outline",
        rating: 5.0,
        ownerRole: USER_ROLE,
        ownerId: userData?._id || userData?.id,
        type: USER_ROLE === "worker" ? "skill_profile" : "job_offer",
      });

      if (response.status === 201) {
        addJob(response.data);
        Alert.alert(
          "Başarılı",
          USER_ROLE === "worker" ? "Profiliniz yayına alındı!" : "İlanınız başarıyla yayına alındı!",
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Yayınlama hatası:", error);
      Alert.alert("Hata", "Sunucu bağlantısı kurulamadı.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {USER_ROLE === "worker" ? "Yeteneklerini Paylaş" : "Yeni İlan Oluştur"}
        </Text>
        <Text style={{ fontSize: 13, color: '#64748B', fontWeight: 'bold' }}>
           Adım {USER_ROLE === "employer" && form.serviceType === "Bull-Tır" ? step + '/5' : (step === 4 ? '2/2' : '1/2')}
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && USER_ROLE === "employer" && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Hangisinde ilan oluşturmak istersiniz?</Text>
              <TouchableOpacity
                style={styles.bigToggleBtn}
                onPress={() => {
                  setForm({ ...form, serviceType: "Bull-Part" });
                  setStep(4);
                }}
              >
                <Text style={styles.bigToggleText}>💼 Bull-Part (Genel İlan)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bigToggleBtn}
                onPress={() => {
                  setForm({ ...form, serviceType: "Bull-Tır" });
                  setStep(2);
                }}
              >
                <Text style={styles.bigToggleText}>🚛 Bull-Tır (Lojistik/Nakliye)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: FROM LOCATION */}
          {step === 2 && form.serviceType === "Bull-Tır" && USER_ROLE === "employer" && (
            <View style={styles.stepContainer}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setStep(1)}><Ionicons name="arrow-back" size={24} color="#003366" /></TouchableOpacity>
                <Text style={styles.stepTitleSmall}>Nereden (Yükleme Noktası)?</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yükleme İli</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowCityModal({ visible: true, type: "from" })}>
                  <Text style={[styles.dateText, !form.fromCity && styles.placeholderText]}>{form.fromCity || "İl Seçiniz..."}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yükleme İlçesi</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => openDistrictSelection("from")}>
                  <Text style={[styles.dateText, !form.fromDistrict && styles.placeholderText]}>{form.fromDistrict || "İlçe Seçiniz..."}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Detaylı Adres (Yükleme)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mahalle, sokak, cadde, fabrika adı vb."
                  multiline
                  value={form.fromAddressDetail}
                  onChangeText={(t) => setForm({ ...form, fromAddressDetail: t })}
                />
              </View>
              <TouchableOpacity style={styles.mainButton} onPress={handleNextStep}>
                <Text style={styles.buttonText}>DEVAM ET</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: TO LOCATION */}
          {step === 3 && form.serviceType === "Bull-Tır" && USER_ROLE === "employer" && (
            <View style={styles.stepContainer}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setStep(2)}><Ionicons name="arrow-back" size={24} color="#003366" /></TouchableOpacity>
                <Text style={styles.stepTitleSmall}>Nereye (Teslimat Noktası)?</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teslimat İli</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowCityModal({ visible: true, type: "to" })}>
                  <Text style={[styles.dateText, !form.toCity && styles.placeholderText]}>{form.toCity || "İl Seçiniz..."}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teslimat İlçesi</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => openDistrictSelection("to")}>
                  <Text style={[styles.dateText, !form.toDistrict && styles.placeholderText]}>{form.toDistrict || "İlçe Seçiniz..."}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Detaylı Adres (Teslimat)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mahalle, sokak, depo bilgisi vb."
                  multiline
                  value={form.toAddressDetail}
                  onChangeText={(t) => setForm({ ...form, toAddressDetail: t })}
                />
              </View>
              <TouchableOpacity style={styles.mainButton} onPress={handleNextStep}>
                <Text style={styles.buttonText}>DEVAM ET</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: JOB/CARGO DETAILS */}
          {(step === 4 || USER_ROLE === "worker") && (
            <View style={styles.stepContainer}>
              {USER_ROLE === "employer" && (
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => setStep(form.serviceType === "Bull-Tır" ? 3 : 1)}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                  </TouchableOpacity>
                  <Text style={styles.stepTitleSmall}>
                    {form.serviceType === "Bull-Tır" ? "Yük / Lojistik Detayları" : "İlan Detayları"}
                  </Text>
                  <View style={{ width: 24 }} />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{USER_ROLE === "worker" ? "Yetenek Başlığı" : "İlan Başlığı"}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={USER_ROLE === "worker" ? "Örn: Profesyonel Garson" : "Örn: İstanbul-Ankara Karışık Yük"}
                  value={form.title}
                  onChangeText={(t) => setForm({ ...form, title: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{USER_ROLE === "worker" ? "Adınız Soyadınız" : "Firma / İşveren Adı"}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: ABC Lojistik veya Ahmet Yılmaz"
                  value={form.company}
                  onChangeText={(t) => setForm({ ...form, company: t })}
                />
              </View>

              {form.serviceType === "Bull-Tır" && USER_ROLE === "employer" && (
                <>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.label}>Tonaj (Ton)</Text>
                      <TextInput style={styles.input} placeholder="Örn: 15" keyboardType="numeric" value={form.tonnage} onChangeText={(t) => setForm({ ...form, tonnage: t })} />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Yükleme Tarihi</Text>
                      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.dateText, !form.loadingDate && styles.placeholderText]}>{form.loadingDate || "Tarih Seç"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.row}>
                     <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Araç / Kasa Tipi</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDropdownModal({visible: true, type: "vehicle", data: VEHICLE_TYPES})}>
                           <Text style={[styles.dateText, !form.vehicleType && styles.placeholderText]} numberOfLines={1}>
                             {form.vehicleType || "Seçiniz..."}
                           </Text>
                        </TouchableOpacity>
                     </View>
                     <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Ürün Cinsi</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDropdownModal({visible: true, type: "product", data: PRODUCT_TYPES})}>
                           <Text style={[styles.dateText, !form.productType && styles.placeholderText]} numberOfLines={1}>
                             {form.productType || "Seçiniz..."}
                           </Text>
                        </TouchableOpacity>
                     </View>
                  </View>
                </>
              )}

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: form.serviceType !== "Bull-Tır" ? 10 : 0 }]}>
                  <Text style={styles.label}>{USER_ROLE === "worker" ? "Beklenen Ücret (₺)" : "Verilecek Ücret (₺)"}</Text>
                  <TextInput style={styles.input} placeholder="1500" keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} />
                </View>
                
                {(form.serviceType === "Bull-Tır" && USER_ROLE === "employer") ? null : (
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Konum (İl, İlçe)</Text>
                    <TextInput style={styles.input} placeholder="İlçe, İl" value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kategori</Text>
                <View style={styles.badgeContainer}>
                  {Object.keys(CATEGORY_DATA).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.badge, form.category === cat && styles.activeBadge]}
                      onPress={() => setForm({ ...form, category: cat, subCategory: "" })}
                    >
                      <Ionicons name={CATEGORY_ICONS[cat]} size={16} color={form.category === cat ? "#FFF" : "#003366"} />
                      <Text style={[styles.badgeText, form.category === cat && styles.activeBadgeText]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {form.category !== "" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Alt Kategori</Text>
                  <View style={styles.badgeContainer}>
                    {CATEGORY_DATA[form.category].map((sub) => (
                      <TouchableOpacity
                        key={sub}
                        style={[styles.badge, form.subCategory === sub && styles.activeBadge]}
                        onPress={() => setForm({ ...form, subCategory: sub })}
                      >
                        <Text style={[styles.badgeText, form.subCategory === sub && styles.activeBadgeText]}>{sub}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {USER_ROLE === "worker" ? "Deneyimlerin ve Yeteneklerin" : "İş/Yük Açıklaması"}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detaylar, notlar, talepler..."
                  multiline
                  value={form.description}
                  onChangeText={(t) => setForm({ ...form, description: t })}
                />
              </View>

              {USER_ROLE === "employer" && form.serviceType === "Bull-Tır" ? (
                 <TouchableOpacity style={styles.mainButton} onPress={handleNextStep}>
                   <Text style={styles.buttonText}>SÖZLEŞME VE ONAY'A GEÇ</Text>
                 </TouchableOpacity>
              ) : (
                 <TouchableOpacity style={[styles.mainButton, {backgroundColor: '#28A745', marginTop: 10}]} onPress={handleNextStep}>
                   <Text style={styles.buttonText}>{USER_ROLE === "worker" ? "PROFİLİ PAYLAŞ" : "İLAN YAYINLA"}</Text>
                 </TouchableOpacity>
              )}
            </View>
          )}

          {/* STEP 5: CONTRACT & SUMMARY (BULL-TIR) */}
          {step === 5 && form.serviceType === "Bull-Tır" && USER_ROLE === "employer" && (
             <View style={styles.stepContainer}>
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => setStep(4)}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                  </TouchableOpacity>
                  <Text style={styles.stepTitleSmall}>Sözleşme ve Onay</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Özet Kartı */}
                <View style={styles.summaryCard}>
                   <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: '#003366'}}>İlan Özeti</Text>
                   <Text style={styles.summaryText}>🚛 <Text style={{fontWeight: 'bold'}}>Yükleme:</Text> {form.fromCity}/{form.fromDistrict}</Text>
                   <Text style={styles.summaryText}>📍 <Text style={{fontWeight: 'bold'}}>Teslimat:</Text> {form.toCity}/{form.toDistrict}</Text>
                   <Text style={styles.summaryText}>⚖️ <Text style={{fontWeight: 'bold'}}>Tonaj:</Text> {form.tonnage} Ton | {form.productType}</Text>
                   <Text style={styles.summaryText}>🚚 <Text style={{fontWeight: 'bold'}}>Araç:</Text> {form.vehicleType}</Text>
                   <Text style={styles.summaryText}>📅 <Text style={{fontWeight: 'bold'}}>Tarih:</Text> {form.loadingDate}</Text>
                </View>

                {/* Komisyon Kartı */}
                <View style={[styles.commissionCard, {marginTop: 10}]}>
                  <View style={styles.commissionHeader}>
                    <Ionicons name="calculator-outline" size={18} color="#003366" />
                    <Text style={styles.commissionTitle}>Komisyon Detayı</Text>
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierBadgeText}>{getCommissionTier(streakDays).label}</Text>
                    </View>
                  </View>
                  {(() => {
                        const preview = calculateEmployerPreview(form.price, streakDays);
                        if (!preview) return <Text>Lütfen ücret giriniz.</Text>;
                        return (
                          <>
                            <View style={styles.commissionRow}>
                              <Text style={styles.commissionLabel}>İlan Ücreti</Text>
                              <Text style={styles.commissionValue}>{preview.basePrice.toLocaleString("tr-TR")} ₺</Text>
                            </View>
                            <View style={styles.commissionRow}>
                              <Text style={styles.commissionLabel}>BULL Komisyonu (%{preview.ratePercent})</Text>
                              <Text style={[styles.commissionValue, { color: "#F59E0B" }]}>+{preview.commission.toLocaleString("tr-TR")} ₺</Text>
                            </View>
                            <View style={styles.commissionDivider} />
                            <View style={styles.commissionRow}>
                              <Text style={styles.commissionTotalLabel}>Toplam Ödeme</Text>
                              <Text style={styles.commissionTotalValue}>{preview.total.toLocaleString("tr-TR")} ₺</Text>
                            </View>
                          </>
                        );
                  })()}
                </View>

                {/* Sözleşme Onay */}
                <TouchableOpacity 
                   style={styles.contractCheckbox}
                   onPress={() => setForm({...form, contractApproved: !form.contractApproved})}
                >
                   <Ionicons 
                     name={form.contractApproved ? "checkbox" : "square-outline"} 
                     size={26} 
                     color={form.contractApproved ? "#28A745" : "#64748B"} 
                   />
                   <Text style={styles.contractText}>
                      Mesafeli Taşıma Sözleşmesi'ni okudum, yük, lokasyon ve komisyon şartlarını onaylıyorum.
                   </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[styles.mainButton, {backgroundColor: form.contractApproved ? '#28A745' : '#CBD5E1', marginTop: 25}]} 
                   onPress={handlePublish}
                   disabled={!form.contractApproved}
                >
                   <Text style={styles.buttonText}>İLAN YAYINLA</Text>
                </TouchableOpacity>
             </View>
          )}
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <View style={Platform.OS === 'ios' ? { backgroundColor: '#F6F4F0', padding: 10, position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 } : null}>
           <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
              textColor="#000000"
           />
           {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.mainButton} onPress={() => setShowDatePicker(false)}>
                 <Text style={styles.buttonText}>Kapat</Text>
              </TouchableOpacity>
           )}
        </View>
      )}

      {/* Şehir Seçim Modalı */}
      <Modal visible={showCityModal.visible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>İl Seçiniz</Text>
                <TouchableOpacity onPress={() => setShowCityModal({ visible: false, type: "" })}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={styles.searchInput} placeholder="Şehir Ara..." value={citySearch} onChangeText={setCitySearch} />
              <FlatList
                data={CITIES.filter(c => c.toLocaleLowerCase('tr-TR').includes(citySearch.toLocaleLowerCase('tr-TR')))}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.cityItem}
                    onPress={() => {
                      if (showCityModal.type === "from") setForm({ ...form, fromCity: item, fromDistrict: "" });
                      else setForm({ ...form, toCity: item, toDistrict: "" });
                      setShowCityModal({ visible: false, type: "" });
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
      <Modal visible={showDistrictModal.visible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{showDistrictModal.cityContext} İlçeleri</Text>
                <TouchableOpacity onPress={() => setShowDistrictModal({ visible: false, type: "", cityContext: "" })}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={styles.searchInput} placeholder="İlçe Ara..." value={districtSearch} onChangeText={setDistrictSearch} />
              
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
                         if (showDistrictModal.type === "from") setForm({ ...form, fromDistrict: item.name });
                         else setForm({ ...form, toDistrict: item.name });
                         setShowDistrictModal({ visible: false, type: "", cityContext: "" });
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

      {/* Dropdown/Picker Modal (Araç Tipi, Ürün Tipi için) */}
      <Modal visible={showDropdownModal.visible} animationType="fade" transparent={true}>
        <View style={[styles.modalOverlay, {justifyContent: 'center', padding: 20}]}>
          <View style={[styles.modalContent, {maxHeight: '70%', borderRadius: 16}]}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seçim Yapınız</Text>
                <TouchableOpacity onPress={() => setShowDropdownModal({ visible: false, type: "", data: [] })}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={showDropdownModal.data}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.cityItem}
                    onPress={() => {
                      if (showDropdownModal.type === "vehicle") setForm({ ...form, vehicleType: item });
                      else if (showDropdownModal.type === "product") setForm({...form, productType: item});
                      setShowDropdownModal({ visible: false, type: "", data: [] });
                    }}
                  >
                    <Text style={styles.cityItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center", backgroundColor: "#FFF" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1A1D21" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", color: "#4A5568", marginBottom: 8, marginLeft: 2, letterSpacing: 0.2 },
  input: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E8E4DE", borderRadius: 14, padding: 15, fontSize: 15, color: "#1A1D21", fontWeight: "500" },
  textArea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  badgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: "#FFF", gap: 6, borderWidth: 1.5, borderColor: "#E8E4DE" },
  activeBadge: { backgroundColor: "#003366", borderColor: "#003366" },
  badgeText: { fontSize: 13, color: "#1A1D21", fontWeight: "600" },
  activeBadgeText: { color: "#FFFFFF" },
  
  commissionCard: { backgroundColor: "#EEF2FF", borderRadius: 18, padding: 16 },
  commissionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  commissionTitle: { fontSize: 14, fontWeight: "800", color: "#003366", flex: 1 },
  tierBadge: { backgroundColor: "#003366", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tierBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFF" },
  commissionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  commissionLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  commissionValue: { fontSize: 14, color: "#1A1D21", fontWeight: "600" },
  commissionDivider: { height: 1, backgroundColor: "#DDDAD4", marginVertical: 8 },
  commissionTotalLabel: { fontSize: 15, color: "#003366", fontWeight: "800" },
  commissionTotalValue: { fontSize: 17, color: "#003366", fontWeight: "800" },
  
  stepContainer: { paddingVertical: 10, gap: 8 },
  stepTitle: { fontSize: 22, fontWeight: "800", color: "#1A1D21", textAlign: "center", marginBottom: 20, marginTop: 20 },
  stepTitleSmall: { fontSize: 18, fontWeight: "700", color: "#1A1D21" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  bigToggleBtn: { backgroundColor: "#FFF", borderWidth: 2, borderColor: "#E8E4DE", borderRadius: 18, padding: 24, alignItems: "center", marginBottom: 15, shadowColor: "#1B2E4B", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  bigToggleText: { fontSize: 18, fontWeight: "700", color: "#1A1D21" },
  dateButton: { height: 52, backgroundColor: "#FFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E8E4DE", justifyContent: "center", paddingHorizontal: 16 },
  dateText: { fontSize: 15, color: "#1A1D21", fontWeight: "500" },
  placeholderText: { color: "#B8BEC7" },
  mainButton: { backgroundColor: "#003366", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 15 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1A1D21" },
  modalCloseText: { fontSize: 15, color: "#EF4444", fontWeight: "700" },
  searchInput: { backgroundColor: "#F6F4F0", borderRadius: 14, padding: 14, marginBottom: 15, fontSize: 15, fontWeight: "500" },
  cityItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F3F1ED" },
  cityItemText: { fontSize: 16, color: "#1A1D21", fontWeight: "500" },
  
  summaryCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 18 },
  summaryText: { fontSize: 14, color: '#4A5568', marginBottom: 8, lineHeight: 20 },
  contractCheckbox: { flexDirection: 'row', alignItems: 'center', marginTop: 25, gap: 12, backgroundColor: '#FFF', padding: 16, borderRadius: 16 },
  contractText: { flex: 1, fontSize: 13, color: '#4A5568', fontWeight: '500', lineHeight: 18 },
});
