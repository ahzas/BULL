// src/screens/Profile/ProfileScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
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
    <View style={[styles.specialIconBox, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.specialTextContent}>
      <Text style={styles.specialTitle}>{title}</Text>
      <Text style={styles.specialSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout, isEmployerMode, setIsEmployerMode } =
    useContext(AuthContext);
  const isEmployer = isEmployerMode;

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. ÜST PROFİL VE AVATAR */}
        <View style={styles.headerCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userSub}>
                {age} Yaşında • ⭐ {user?.user?.rating?.toFixed(1) || user?.rating?.toFixed(1) || "5.0"} 
                <Text style={{ fontSize: 11, color: "#94A3B8" }}> ({user?.user?.ratingCount || user?.ratingCount || 0} Değerlendirme)</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* 2. ROL GEÇİŞİ */}
          <View
            style={[styles.roleToggle, isEmployer && styles.roleToggleEmployer]}
          >
            <View>
              <Text style={[styles.roleText, isEmployer && { color: "#FFF" }]}>
                {isEmployer ? "İşveren Paneli Aktif" : "İşçi Modu Aktif"}
              </Text>
              <Text
                style={[styles.roleSubText, isEmployer && { color: "#E2E8F0" }]}
              >
                {isEmployer ? "İlanları yönetin" : "Günlük işleri bulun"}
              </Text>
            </View>
            <Switch
              value={isEmployer}
              onValueChange={setIsEmployerMode}
              trackColor={{ false: "#CBD5E1", true: "#28A745" }}
              thumbColor={"#FFF"}
            />
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
            <Ionicons name="card-outline" size={20} color="#64748B" />
            <Text style={styles.standardOptionText}>
              Ödeme Yöntemlerim & IBAN
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.standardOption}
            onPress={() => navigation.navigate("Help")}
          >
            <Ionicons name="help-circle-outline" size={20} color="#64748B" />
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
            size={20}
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

// ... styles kısmı aynı kalacak

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#003366",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userNameContainer: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },
  userSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  roleToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roleToggleEmployer: {
    backgroundColor: "#003366",
    borderColor: "#003366",
  },
  roleText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  roleSubText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  specialCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  specialIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  specialTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  specialTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  specialSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  standardOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  standardOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 16,
  },
});
