// src/screens/Profile/SettingsScreen.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { COMMISSION_TIERS, getCommissionTier } from "../../utils/commission";

// --- Yardımcı Bileşenler ---
const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={icon} size={18} color="#94A3B8" />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
  editable,
  onChangeText,
  keyboardType,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color="#003366" />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    {editable ? (
      <TextInput
        style={styles.infoInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        placeholder="—"
        placeholderTextColor="#CBD5E1"
      />
    ) : (
      <Text style={styles.infoValue}>{value || "—"}</Text>
    )}
  </View>
);

const ToggleRow = ({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  color,
  disabled,
}) => (
  <View style={[styles.toggleRow, disabled && { opacity: 0.5 }]}>
    <View style={styles.toggleLeft}>
      <View
        style={[
          styles.infoIconBox,
          { backgroundColor: (color || "#003366") + "12" },
        ]}
      >
        <Ionicons name={icon} size={18} color={color || "#003366"} />
      </View>
      <View style={styles.toggleTextBox}>
        <Text style={styles.infoLabel}>{label}</Text>
        {subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#DDDAD4", true: "#28A745" }}
      thumbColor="#FFF"
      disabled={disabled}
    />
  </View>
);

const ActionRow = ({ icon, label, onPress, color, danger }) => (
  <TouchableOpacity
    style={[styles.actionRow, danger && styles.actionRowDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.infoLeft}>
      <View
        style={[
          styles.infoIconBox,
          { backgroundColor: (color || "#003366") + "12" },
        ]}
      >
        <Ionicons name={icon} size={18} color={color || "#003366"} />
      </View>
      <Text style={[styles.infoLabel, danger && { color: "#EF4444" }]}>
        {label}
      </Text>
    </View>
    <Ionicons
      name="chevron-forward"
      size={16}
      color={danger ? "#EF4444" : "#CBD5E1"}
    />
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const userData = user?.user || user;

  // --- DİNAMİK KULLANICI VERİLERİ ---
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [birthDate, setBirthDate] = useState(userData?.birthDate || "");

  // --- DİNAMİK TERCİHLER ---
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);

  // Dinamik veriler
  const role = userData?.role === "employer" ? "İşveren" : "İşçi";
  const rating = userData?.rating?.toFixed(1) || "5.0";
  const streak = userData?.streak || 0;
  const bullPoints = userData?.bullPoints || 0;
  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  // Kullanıcı verisi değişince form alanlarını güncelle
  useEffect(() => {
    const d = user?.user || user;
    if (d) {
      setName(d.name || "");
      setEmail(d.email || "");
      setBirthDate(d.birthDate || "");
    }
  }, [user]);

  // AsyncStorage'dan tercihleri yükle + bildirim izin durumunu kontrol et
  useEffect(() => {
    const init = async () => {
      // Tercihleri yükle
      try {
        const prefs = await AsyncStorage.getItem("@user_settings");
        if (prefs) {
          const parsed = JSON.parse(prefs);
          setEmailNotifications(parsed.emailNotifications ?? false);
          setJobAlerts(parsed.jobAlerts ?? true);
          setLocationSharing(parsed.locationSharing ?? false);
        }
      } catch (e) {
        console.log("Tercih yükleme hatası:", e);
      }

      // Gerçek bildirim izin durumunu kontrol et
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPushNotifications(status === "granted");
      } catch (e) {
        console.log("Bildirim izin kontrolü hatası:", e);
      }
    };
    init();
  }, []);

  // Tercihleri kaydet
  const savePreference = async (key, value) => {
    try {
      const prefs = await AsyncStorage.getItem("@user_settings");
      const parsed = prefs ? JSON.parse(prefs) : {};
      parsed[key] = value;
      await AsyncStorage.setItem("@user_settings", JSON.stringify(parsed));
    } catch (e) {
      console.log("Tercih kaydetme hatası:", e);
    }
  };

  // --- BİLDİRİM TOGGLE (GERÇEK İZİN YÖNETİMİ) ---
  const handlePushToggle = async () => {
    if (pushNotifications) {
      // Bildirimleri kapat → ayarlara yönlendir (OS düzeyinde kapatma)
      Alert.alert(
        "Bildirimleri Kapat",
        "Anlık bildirimleri kapatmak için cihaz ayarlarınızdan BULL uygulama bildirimlerini devre dışı bırakın.",
        [{ text: "Tamam", style: "default" }],
      );
    } else {
      // Bildirimleri aç → izin iste
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        if (existingStatus === "granted") {
          setPushNotifications(true);
          Alert.alert("Başarılı", "Bildirimler açıldı!");
          return;
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (status === "granted") {
          setPushNotifications(true);
          Alert.alert("Başarılı", "Bildirimler başarıyla açıldı!");
        } else {
          Alert.alert(
            "İzin Gerekli",
            "Bildirim izni verilemedi. Lütfen cihaz ayarlarından BULL için bildirimlere izin verin.",
          );
        }
      } catch (e) {
        console.log("Bildirim izin hatası:", e);
        Alert.alert("Hata", "Bildirim izni alınırken bir sorun oluştu.");
      }
    }
  };

  const handleToggle = (key, currentValue, setter) => {
    const newValue = !currentValue;
    setter(newValue);
    savePreference(key, newValue);
  };

  // --- PROFİL KAYDET (VERİTABANINA) ---
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Ad Soyad alanı boş bırakılamaz.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Hata", "E-posta alanı boş bırakılamaz.");
      return;
    }

    setSaving(true);
    const result = await updateUser({
      name: name.trim(),
      email: email.trim(),
      birthDate: birthDate.trim(),
    });
    setSaving(false);

    if (result.success) {
      setEditMode(false);
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi ve kaydedildi.");
    } else {
      Alert.alert(
        "Hata",
        result.message || "Güncelleme sırasında bir sorun oluştu.",
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabı Sil",
      "Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: () => {
            logout();
            navigation.replace("Login");
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Çıkış", "Oturumu kapatmak istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Evet",
        onPress: () => {
          logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ══════════════ HESAP BİLGİLERİ ══════════════ */}
          <SectionHeader title="Hesap Bilgileri" icon="person-circle-outline" />
          <View style={styles.card}>
            <InfoRow
              icon="person-outline"
              label="Ad Soyad"
              value={name}
              editable={editMode}
              onChangeText={setName}
            />
            <InfoRow
              icon="mail-outline"
              label="E-Posta"
              value={email}
              editable={editMode}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <InfoRow
              icon="calendar-outline"
              label="Doğum Tarihi"
              value={birthDate}
              editable={editMode}
              onChangeText={setBirthDate}
            />
            <InfoRow
              icon="shield-checkmark-outline"
              label="Hesap Türü"
              value={role}
            />
            <InfoRow
              icon="time-outline"
              label="Üyelik Tarihi"
              value={memberSince}
            />

            {/* Düzenle / Kaydet Butonu */}
            <TouchableOpacity
              style={[styles.editBtn, editMode && styles.editBtnSave]}
              onPress={editMode ? handleSaveProfile : () => setEditMode(true)}
              activeOpacity={0.7}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={editMode ? "checkmark-circle" : "create-outline"}
                    size={18}
                    color={editMode ? "#FFF" : "#003366"}
                  />
                  <Text
                    style={[
                      styles.editBtnText,
                      editMode && styles.editBtnTextSave,
                    ]}
                  >
                    {editMode ? "Değişiklikleri Kaydet" : "Profili Düzenle"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ══════════════ İSTATİSTİKLER ══════════════ */}
          <SectionHeader title="İstatistiklerim" icon="stats-chart-outline" />
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>⭐ {rating}</Text>
              <Text style={styles.statLabel}>Puan</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>🔥 {streak}</Text>
              <Text style={styles.statLabel}>Seri Gün</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>🏆 {bullPoints}</Text>
              <Text style={styles.statLabel}>BULL Puan</Text>
            </View>
          </View>

          {/* ══════════════ KOMİSYON KADEMESİ ══════════════ */}
          <SectionHeader
            title="Komisyon Kademem"
            icon="trending-down-outline"
          />
          <View style={styles.card}>
            <View style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#003366",
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 12, fontWeight: "800" }}
                  >
                    {getCommissionTier(streak).label}
                  </Text>
                </View>
                <Text style={{ color: "#64748B", fontSize: 12 }}>
                  {streak} gün seri
                </Text>
              </View>
              {COMMISSION_TIERS.slice()
                .reverse()
                .map((tier, index) => {
                  const isActive =
                    getCommissionTier(streak).label === tier.label;
                  return (
                    <View
                      key={tier.label}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        borderBottomWidth:
                          index < COMMISSION_TIERS.length - 1 ? 1 : 0,
                        borderBottomColor: "#F3F1ED",
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          marginRight: 12,
                          backgroundColor: isActive ? "#28A745" : "#CBD5E1",
                        }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: isActive ? "700" : "500",
                          color: isActive ? "#003366" : "#64748B",
                        }}
                      >
                        {tier.label} ({tier.minDays}+ gün)
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isActive ? "#003366" : "#94A3B8",
                          fontWeight: "600",
                        }}
                      >
                        %{(tier.employerRate * 100).toFixed(0)} / %
                        {(tier.workerRate * 100).toFixed(0)}
                      </Text>
                    </View>
                  );
                })}
              <Text
                style={{
                  fontSize: 10,
                  color: "#94A3B8",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                İşveren / İşçi komisyon oranları • Seri arttıkça komisyon düşer
              </Text>
            </View>
          </View>

          {/* ══════════════ BİLDİRİM TERCİHLERİ ══════════════ */}
          <SectionHeader
            title="Bildirim Tercihleri"
            icon="notifications-outline"
          />
          <View style={styles.card}>
            <ToggleRow
              icon="notifications"
              label="Anlık Bildirimler"
              subtitle={
                pushNotifications
                  ? "Bildirimler açık (cihaz izni verildi)"
                  : "Bildirimler kapalı — izin verin"
              }
              value={pushNotifications}
              onValueChange={handlePushToggle}
              color="#6366F1"
            />
            <ToggleRow
              icon="mail"
              label="E-Posta Bildirimleri"
              subtitle="Haftalık özet ve kampanyalar"
              value={emailNotifications}
              onValueChange={() =>
                handleToggle(
                  "emailNotifications",
                  emailNotifications,
                  setEmailNotifications,
                )
              }
              color="#F59E0B"
            />
            <ToggleRow
              icon="briefcase"
              label="İş Uyarıları"
              subtitle="Sana uygun yeni ilanlar"
              value={jobAlerts}
              onValueChange={() =>
                handleToggle("jobAlerts", jobAlerts, setJobAlerts)
              }
              color="#28A745"
            />
          </View>

          {/* ══════════════ GİZLİLİK VE GÜVENLİK ══════════════ */}
          <SectionHeader
            title="Gizlilik ve Güvenlik"
            icon="lock-closed-outline"
          />
          <View style={styles.card}>
            <ToggleRow
              icon="location"
              label="Konum Paylaşımı"
              subtitle="Haritada konumunu diğer kullanıcılara göster"
              value={locationSharing}
              onValueChange={() =>
                handleToggle(
                  "locationSharing",
                  locationSharing,
                  setLocationSharing,
                )
              }
              color="#EF4444"
            />
            <ActionRow
              icon="key-outline"
              label="Şifre Değiştir"
              color="#6366F1"
              onPress={() => navigation.navigate("ChangePassword")}
            />
          </View>

          {/* ══════════════ UYGULAMA ══════════════ */}
          <SectionHeader title="Uygulama" icon="phone-portrait-outline" />
          <View style={styles.card}>
            <ActionRow
              icon="document-text-outline"
              label="Kullanım Koşulları"
              onPress={() => navigation.navigate("Terms")}
            />
            <ActionRow
              icon="shield-outline"
              label="Gizlilik Politikası"
              onPress={() => navigation.navigate("Privacy")}
            />
            <InfoRow
              icon="information-circle-outline"
              label="Uygulama Sürümü"
              value="1.0.0 (Beta)"
            />
          </View>

          {/* ══════════════ HESAP İŞLEMLERİ ══════════════ */}
          <SectionHeader title="Hesap İşlemleri" icon="warning-outline" />
          <View style={styles.card}>
            <ActionRow
              icon="log-out-outline"
              label="Oturumu Kapat"
              color="#F59E0B"
              onPress={handleLogout}
            />
            <ActionRow
              icon="trash-outline"
              label="Hesabımı Sil"
              color="#EF4444"
              danger
              onPress={handleDeleteAccount}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D21",
    letterSpacing: 0.3,
  },
  scrollContent: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8C95A3",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 4,
    shadowColor: "#1B2E4B",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F1ED",
  },
  infoLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: { fontSize: 14, fontWeight: "600", color: "#1A1D21" },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    maxWidth: "45%",
    textAlign: "right",
  },
  infoInput: {
    fontSize: 14,
    fontWeight: "500",
    color: "#003366",
    backgroundColor: "#F6F4F0",
    borderWidth: 1.5,
    borderColor: "#E8E4DE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 140,
    textAlign: "right",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F1ED",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  toggleTextBox: { flex: 1 },
  toggleSubtitle: { fontSize: 11, color: "#8C95A3", marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F1ED",
  },
  actionRowDanger: { borderBottomWidth: 0 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F3F1ED",
  },
  editBtnSave: { backgroundColor: "#28A745" },
  editBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003366",
    marginLeft: 8,
  },
  editBtnTextSave: { color: "#FFF" },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#1B2E4B",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1A1D21" },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8C95A3",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
