// src/screens/Profile/ProfileScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const userData = user?.user || user;
  const isEmployer = userData?.role === "employer";

  const MENU_ITEMS = [
    { icon: "settings-outline", label: "Ayarlar", screen: "Settings" },
    { icon: "lock-closed-outline", label: "Şifre Değiştir", screen: "ChangePassword" },
    ...(isEmployer ? [
      { icon: "people-outline", label: "Aktif Çalışanlar", screen: "ActiveWorkers" },
      { icon: "business-outline", label: "İşletme Profili", screen: "BusinessProfile" },
    ] : []),
    { icon: "document-text-outline", label: "Kullanım Koşulları", screen: "Terms" },
    { icon: "shield-checkmark-outline", label: "Gizlilik Politikası", screen: "Privacy" },
  ];

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: () => logout() },
    ]);
  };

  const initial = (userData?.name || "?")[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* PROFİL KARTI */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData?.name || "Kullanıcı"}</Text>
            <Text style={styles.userEmail}>{userData?.email || ""}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{isEmployer ? "İşveren" : "İşçi"}</Text>
            </View>
          </View>
        </View>

        {/* İSTATİSTİKLER */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{userData?.rating?.toFixed(1) || "5.0"}</Text>
            <Text style={styles.statLabel}>Puan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{userData?.ratingCount || 0}</Text>
            <Text style={styles.statLabel}>Değerlendirme</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{userData?.streak || 0}</Text>
            <Text style={styles.statLabel}>Gün Serisi</Text>
          </View>
        </View>

        {/* MENÜ */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={20} color="#555" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ÇIKIŞ */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#E53935" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.version}>BULL v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  profileCard: {
    backgroundColor: "#FFF", margin: 12, borderRadius: 10,
    padding: 20, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#003366", justifyContent: "center", alignItems: "center",
  },
  avatarLetter: { color: "#FFF", fontSize: 24, fontWeight: "800" },
  profileInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", color: "#222" },
  userEmail: { fontSize: 13, color: "#888", marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start", marginTop: 6,
    backgroundColor: '#F0F4FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4,
  },
  roleText: { fontSize: 12, fontWeight: "600", color: "#003366" },
  // İSTATİSTİK
  statsRow: {
    flexDirection: "row", backgroundColor: "#FFF",
    marginHorizontal: 12, borderRadius: 10,
    paddingVertical: 16, borderWidth: 1, borderColor: '#EBEBEB',
    marginBottom: 12,
  },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "700", color: "#222" },
  statLabel: { fontSize: 11, color: "#999", marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: "#EBEBEB" },
  // MENÜ
  menuCard: {
    backgroundColor: "#FFF", marginHorizontal: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  menuRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  menuLabel: { flex: 1, marginLeft: 14, fontSize: 15, color: "#333", fontWeight: '500' },
  // ÇIKIŞ
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    margin: 12, paddingVertical: 14, borderRadius: 10,
    backgroundColor: "#FFF", borderWidth: 1, borderColor: '#EBEBEB', gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#E53935" },
  version: { textAlign: "center", fontSize: 12, color: "#ccc", marginVertical: 20 },
});
