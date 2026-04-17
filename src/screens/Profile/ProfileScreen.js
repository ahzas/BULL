// src/screens/Profile/ProfileScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";
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
  const { user, logout, setUser } = useContext(AuthContext);
  const userData = user?.user || user;
  const isEmployer = userData?.role === "employer";

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const userId = userData?._id || userData?.id;
          if (!userId) return;
          const res = await axios.get(`${API_BASE}/users/${userId}`);
          setUser(res.data);
        } catch (error) {
          console.log("Profil güncellenemedi:", error.message);
        }
      };
      fetchProfile();
    }, [userData?._id, userData?.id])
  );

  // Veri Kontrolü: Backend'den gelen ismin kaybolmaması için geliştirilmiş mantık
  const getFullName = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData?.name || "Kullanıcı";
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

  const birthDate = userData?.birthDate;
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

          {/* 2. STATİK ROL GÖSTERGESİ (TIKLANABİLİR) */}
          <TouchableOpacity 
            style={styles.roleStaticBadge}
            onPress={() => isEmployer ? navigation.navigate("EmployerProfile") : navigation.navigate("WorkerProfile")}
            activeOpacity={0.8}
          >
            <Ionicons name={isEmployer ? "briefcase" : "hammer"} size={20} color="#FFF" />
            <Text style={styles.roleStaticBadgeText}>
              {isEmployer ? "İşveren Profili" : "İşçi Profili"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" style={{ position: 'absolute', right: 15 }} />
          </TouchableOpacity>
        </View>

        {/* 3. ÖZEL MENÜLER (DİNAMİK) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEmployer ? "İşveren Araçları" : "BULL Ayrıcalıkları"}
          </Text>

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
  roleStaticBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 10,
    gap: 10,
    position: "relative"
  },
  roleStaticBadgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
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
