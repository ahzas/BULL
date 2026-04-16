// src/screens/Profile/ProfileScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { getCommissionTier } from "../../utils/commission";

// Uyarıyı önlemek için dışarıda tanımlanan bileşen
const SpecialMenu = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity
    style={styles.specialCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.specialIconBox, { backgroundColor: color + "12" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.specialTextContent}>
      <Text style={styles.specialTitle}>{title}</Text>
      <Text style={styles.specialSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.menuArrow}>
      <Ionicons name="chevron-forward" size={16} color="#B8BEC7" />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const isEmployer = user?.user?.role === "employer" || user?.role === "employer";

  // Veri Kontrolü: Backend'den gelen ismin kaybolmaması için geliştirilmiş mantık
  const getFullName = () => {
    const data = user?.user || user;
    if (data?.firstName && data?.lastName) {
      return `${data.firstName} ${data.lastName}`;
    }
    return data?.name || "Kullanıcı";
  };

  const fullName = getFullName();
  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return "--";
    let birthDate;
    if (birthDateStr.includes("/")) {
      const [day, month, year] = birthDateStr.split("/");
      birthDate = new Date(`${year}-${month}-${day}`);
    } else {
      birthDate = new Date(birthDateStr);
    }
    if (isNaN(birthDate)) return "--";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const birthDate = user?.user?.birthDate || user?.birthDate;
  const age = calculateAge(birthDate);

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

  const initials = fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. ÜST PROFİL — KOYU ARKAPLAN */}
        <View style={styles.headerCard}>
          <View style={styles.headerBg}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <TouchableOpacity style={styles.editBadge}>
                  <Ionicons name="camera" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{fullName}</Text>
                <Text style={styles.userSub}>
                  {age} Yaşında • ⭐ {user?.user?.rating?.toFixed(1) || user?.rating?.toFixed(1) || "5.0"} 
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}> ({user?.user?.ratingCount || user?.ratingCount || 0})</Text>
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.settingsBtn}
                onPress={() => navigation.navigate("Settings")}
              >
                <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            {/* 2. ROL GÖSTERGESİ */}
            <View style={styles.roleBadge}>
              <Ionicons name={isEmployer ? "briefcase" : "hammer"} size={16} color={isEmployer ? "#003366" : "#28A745"} />
              <Text style={styles.roleBadgeText}>
                {isEmployer ? "İşveren Profili" : "İşçi Profili"}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. ÖZEL MENÜLER (DİNAMİK) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEmployer ? "İşveren Araçları" : "BULL Ayrıcalıkları"}
          </Text>

          {!isEmployer ? (
            <>
              <SpecialMenu
                icon="trending-down-outline"
                title="Komisyon Seviyem"
                subtitle={`${getCommissionTier(user?.streak || 0).label} • İşçi %${(getCommissionTier(user?.streak || 0).workerRate * 100).toFixed(0)} | İşveren %${(getCommissionTier(user?.streak || 0).employerRate * 100).toFixed(0)}`}
                color="#28A745"
                onPress={() => navigation.navigate("Settings")}
              />
            </>
          ) : (
            <>
              <SpecialMenu
                icon="business-outline"
                title="İşletme Profilim"
                subtitle="Sarp Gıda Ltd. Şti." // İşletme bilginiz buraya bağlandı [cite: 2025-10-12]
                color="#003366"
                onPress={() => navigation.navigate("BusinessProfile")} // Navigasyon eklendi
              />
              <SpecialMenu
                icon="people-outline"
                title="Aktif Çalışanlarım"
                subtitle="Sahadaki personeli takip edin."
                color="#6366F1"
                onPress={() => navigation.navigate("ActiveWorkers")} // Navigasyon eklendi
              />
            </>
          )}

          <SpecialMenu
            icon="heart-outline"
            title="Ahde Vefa Puanları"
            subtitle={`${user?.bullPoints || 0} Puan`}
            color="#EF4444"
            onPress={() =>
              Alert.alert(
                "Puanlarım",
                "Ahde Vefa puanlarınızla ayrıcalık kazanın.",
              )
            }
          />
        </View>

        {/* 4. GENEL AYARLAR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel</Text>
          <TouchableOpacity style={styles.standardOption}>
            <View style={[styles.optionIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="card-outline" size={18} color="#6366F1" />
            </View>
            <Text style={styles.standardOptionText}>
              Ödeme Yöntemlerim & IBAN
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.standardOption}
            onPress={() => navigation.navigate("Help")}
          >
            <View style={[styles.optionIconBox, { backgroundColor: '#FFF4E5' }]}>
              <Ionicons name="help-circle-outline" size={18} color="#E67E22" />
            </View>
            <Text style={styles.standardOptionText}>
              Yardım ve Destek (ITSM)
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* 5. ÇIKIŞ */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={18}
            color="#EF4444"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutBtnText}>Oturumu Kapat</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F4F0",
  },
  headerCard: {
    backgroundColor: "#003366",
  },
  headerBg: {
    padding: 20,
    paddingBottom: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
  },
  editBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#28A745",
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#003366",
  },
  userNameContainer: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
  roleBadgeText: {
    color: "#1A1D21",
    fontWeight: "700",
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8C95A3",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  specialCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#1B2E4B",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  specialIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  specialTextContent: {
    flex: 1,
    marginLeft: 14,
  },
  specialTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1D21",
  },
  specialSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  menuArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
  },
  standardOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  standardOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#1A1D21",
    fontWeight: "600",
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
  },
  logoutBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15,
  },
});
