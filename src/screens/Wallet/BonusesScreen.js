import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WalletContext } from '../../context/WalletContext';
import { AuthContext } from '../../context/AuthContext';

export default function BonusesScreen({ navigation }) {
  const { balance } = useContext(WalletContext);
  const { user } = useContext(AuthContext);

  const recentBonuses = [
    { id: '1', title: '10. Gün Streak Bonusu', amount: '+100 TL', date: '3 gün önce' },
    { id: '2', title: '5 Yıldız İş Tamamlama', amount: '+15 Puan', date: '5 gün önce' },
    { id: '3', title: 'Referans Ödülü', amount: '+200 TL', date: '1 hafta önce' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bonuslarım</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* AKTİF STREAK KARTI */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Ionicons name="flame" size={50} color="#FF8C00" />
            <Text style={styles.streakDays}>{balance.activeStreak}</Text>
          </View>
          <View style={styles.streakRight}>
            <Text style={styles.streakTitle}>Aktif Seriniz (Streak)</Text>
            <Text style={styles.streakDesc}>
              Aralıksız çalışarak Komisyon Kesinti Oranlarınızı düşürün! Şimdiden harika gidiyorsunuz.
            </Text>
          </View>
        </View>

        {/* AHDE VEFA KARTI */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsIconBox}>
            <Ionicons name="heart" size={24} color="#EF4444" />
          </View>
          <View style={styles.pointsContent}>
            <Text style={styles.pointsTitle}>Ahde Vefa Puanınız</Text>
            <Text style={styles.pointsValue}>{user?.bullPoints || user?.user?.bullPoints || 0} Puan</Text>
          </View>
          <TouchableOpacity style={styles.pointsBtn}>
            <Text style={styles.pointsBtnText}>Harca</Text>
          </TouchableOpacity>
        </View>

        {/* BİLGİLENDİRME */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Bugüne kadar bonuslar ve ödüllerden toplam <Text style={{fontWeight: 'bold', color: '#FFF'}}>{balance.totalBonusEarned} TL</Text> kazandınız.
          </Text>
        </View>

        {/* GEÇMİŞ KAZANIMLAR */}
        <Text style={styles.sectionTitle}>Son Kazanımlar</Text>
        {recentBonuses.map(item => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyIcon}>
              <Ionicons 
                name={item.amount.includes('Puan') ? "star" : "cash"} 
                size={22} 
                color={item.amount.includes('Puan') ? "#F59E0B" : "#28A745"} 
              />
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <Text style={[
              styles.historyAmount,
              { color: item.amount.includes('Puan') ? "#F59E0B" : "#28A745" }
            ]}>
              {item.amount}
            </Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  scrollContent: { padding: 20 },

  streakCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF4E5',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFEDD5'
  },
  streakLeft: { alignItems: 'center', marginRight: 20 },
  streakDays: { fontSize: 24, fontWeight: '900', color: '#FF8C00', marginTop: -5 },
  streakRight: { flex: 1 },
  streakTitle: { fontSize: 16, fontWeight: 'bold', color: '#9A3412', marginBottom: 5 },
  streakDesc: { fontSize: 12, color: '#C2410C', lineHeight: 18 },

  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  pointsIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  pointsContent: { flex: 1, marginLeft: 15 },
  pointsTitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  pointsValue: { fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginTop: 2 },
  pointsBtn: { backgroundColor: '#EF4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  pointsBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  infoBanner: {
    backgroundColor: '#003366',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30
  },
  infoBannerText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20, textAlign: 'center' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  historyIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyDetails: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  historyDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  historyAmount: { fontSize: 16, fontWeight: 'bold' }
});
