// src/screens/Wallet/WalletScreen.js
import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function WalletScreen() {
  // Örnek Veriler (Backend'den gelecek)
  const walletData = {
    balance: "4.750,00",
    activeStreak: 12, // 12 gündür aralıksız çalışıyor
    bonusRate: "%8",   // Mevcut streak sayesinde kazandığı ek komisyon
    totalBonusEarned: "380,00"
  };

  const transactions = [
    { id: '1', title: 'Garsonluk Ödemesi', date: 'Bugün', amount: '+450 TL', type: 'earn' },
    { id: '2', title: 'Streak Bonusu (%5)', date: 'Bugün', amount: '+22.5 TL', type: 'bonus' },
    { id: '3', title: 'Banka Hesabına Çekim', date: 'Dün', amount: '-1.200 TL', type: 'withdraw' },
  ];

  const getTransIcon = (type) => {
    switch (type) {
      case 'earn': return { name: 'arrow-down-circle', color: '#28A745' };
      case 'bonus': return { name: 'gift', color: '#E5A100' };
      case 'withdraw': return { name: 'arrow-up-circle', color: '#EF4444' };
      default: return { name: 'ellipse', color: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cüzdanım</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#1A1D21" />
          </TouchableOpacity>
        </View>

        {/* BAKİYE KARTI */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Mevcut Bakiyem</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>{walletData.balance}</Text>
              <Text style={styles.currency}>₺</Text>
            </View>
          </View>
          <View style={styles.streakBanner}>
            <View style={styles.streakIconBox}>
              <Ionicons name="flame" size={18} color="#FFF" />
            </View>
            <Text style={styles.streakText}>
              <Text style={{fontWeight: '700'}}>{walletData.activeStreak} Günlük Seri!</Text>{' '}
              Bir sonraki işinde {walletData.bonusRate} ek kazanç.
            </Text>
          </View>
        </View>

        {/* HIZLI İŞLEMLER */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIconBox, {backgroundColor: '#E8F5EC'}]}>
              <Ionicons name="wallet-outline" size={22} color="#1B7A30" />
            </View>
            <Text style={styles.quickLabel}>Bakiyem</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIconBox, {backgroundColor: '#FFF4E5'}]}>
              <Ionicons name="cash-outline" size={22} color="#E67E22" />
            </View>
            <Text style={styles.quickLabel}>Para Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIconBox, {backgroundColor: '#EEF2FF'}]}>
              <Ionicons name="gift-outline" size={22} color="#6366F1" />
            </View>
            <Text style={styles.quickLabel}>Bonuslar</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>Yeni</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SON İŞLEMLER */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Tümünü Gör →</Text></TouchableOpacity>
        </View>

        {transactions.map((item) => {
          const iconInfo = getTransIcon(item.type);
          return (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[styles.transIconBox, { backgroundColor: iconInfo.color + '12' }]}>
                <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
              </View>
              <View style={styles.transDetails}>
                <Text style={styles.transTitle}>{item.title}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
              </View>
              <Text style={[
                styles.transAmount, 
                { color: item.type === 'withdraw' ? "#EF4444" : "#1B7A30" }
              ]}>
                {item.amount}
              </Text>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F4F0' },
  scrollContent: { padding: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1D21' },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // BAKİYE KARTI
  balanceCard: {
    backgroundColor: '#003366',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#003366',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  balanceTop: {
    padding: 24,
    paddingBottom: 20,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  balanceAmount: { color: '#FFF', fontSize: 38, fontWeight: '900', letterSpacing: -0.5 },
  currency: { color: '#28A745', fontSize: 22, fontWeight: '800', marginLeft: 6, marginBottom: 6 },
  streakBanner: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  streakIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1, lineHeight: 18 },
  // HIZLI İŞLEMLER
  quickActions: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickAction: { 
    flex: 1,
    backgroundColor: '#FFF', 
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickIconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: '700', color: '#1A1D21' },
  newBadge: { 
    backgroundColor: '#28A745', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 8,
    marginTop: 6,
  },
  newBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  // GEÇMİŞ
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1A1D21' },
  seeAll: { color: '#003366', fontSize: 13, fontWeight: '700' },
  transactionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 10,
  },
  transIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transDetails: { flex: 1 },
  transTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D21' },
  transDate: { fontSize: 12, color: '#8C95A3', marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: '800' }
});