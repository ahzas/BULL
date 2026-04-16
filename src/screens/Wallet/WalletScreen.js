// src/screens/Wallet/WalletScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

export default function WalletScreen() {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;
  const streakDays = userData?.streak || 0;

  const transactions = [
    { id: 1, type: "earning", title: "İş Tamamlama", amount: "+1.200 ₺", date: "14 Nis" },
    { id: 2, type: "bonus", title: "Streak Bonusu (%5)", amount: "+60 ₺", date: "14 Nis" },
    { id: 3, type: "withdrawal", title: "Para Çekme", amount: "-800 ₺", date: "12 Nis" },
  ];

  const getIcon = (type) => {
    switch (type) {
      case "earning": return { name: "arrow-down-circle-outline", color: "#2E7D32" };
      case "bonus": return { name: "gift-outline", color: "#F5A623" };
      case "withdrawal": return { name: "arrow-up-circle-outline", color: "#E53935" };
      default: return { name: "card-outline", color: "#999" };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* BAKİYE KARTI */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Toplam Bakiye</Text>
          <Text style={styles.balanceAmount}>{userData?.balance || "0"} ₺</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakText}>🔥 {streakDays} Gün Seri</Text>
          </View>
        </View>

        {/* HIZLI İŞLEMLER */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn}>
            <Ionicons name="wallet-outline" size={22} color="#003366" />
            <Text style={styles.quickLabel}>Bakiye</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <Ionicons name="arrow-up-outline" size={22} color="#003366" />
            <Text style={styles.quickLabel}>Para Çek</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <Ionicons name="gift-outline" size={22} color="#003366" />
            <Text style={styles.quickLabel}>Bonuslar</Text>
          </TouchableOpacity>
        </View>

        {/* İŞLEM GEÇMİŞİ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <View style={styles.listCard}>
            {transactions.map((tx, i) => {
              const icon = getIcon(tx.type);
              return (
                <View key={tx.id} style={[styles.txRow, i === transactions.length - 1 && { borderBottomWidth: 0 }]}>
                  <Ionicons name={icon.name} size={20} color={icon.color} />
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <Text style={[styles.txAmount, tx.type === "withdrawal" && { color: "#E53935" }]}>{tx.amount}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  // BAKİYE
  balanceCard: {
    backgroundColor: "#003366", margin: 12, borderRadius: 10,
    padding: 24, alignItems: "center",
  },
  balanceLabel: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  balanceAmount: { fontSize: 36, fontWeight: "800", color: "#FFF", marginTop: 4 },
  streakRow: { marginTop: 12, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  streakText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  // HIZLI
  quickRow: {
    flexDirection: "row", marginHorizontal: 12, gap: 10, marginBottom: 8,
  },
  quickBtn: {
    flex: 1, backgroundColor: "#FFF", borderRadius: 10,
    paddingVertical: 16, alignItems: "center",
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  quickLabel: { fontSize: 12, color: "#555", fontWeight: "600", marginTop: 6 },
  // İŞLEMLER
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: "#888",
    paddingHorizontal: 16, paddingVertical: 10,
    textTransform: 'uppercase',
  },
  listCard: { backgroundColor: "#FFF", borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EBEBEB' },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: "600", color: "#222" },
  txDate: { fontSize: 12, color: "#999", marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "700", color: "#2E7D32" },
});