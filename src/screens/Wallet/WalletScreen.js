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

import { useContext } from 'react';
import { WalletContext } from '../../context/WalletContext';

export default function WalletScreen({ navigation }) {
  const { balance, transactions } = useContext(WalletContext);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cüzdanım</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#003366" />
          </TouchableOpacity>
        </View>

        {/* BAKİYE KARTI */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Mevcut Bakiyem</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{(balance.available || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.currency}>₺</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.streakInfo}>
            <Ionicons name="flame" size={20} color="#FF8C00" />
            <Text style={styles.streakText}>
              <Text style={{fontWeight: 'bold'}}>{balance.activeStreak} Günlük Seri!</Text> Bir sonraki işinde {balance.bonusRate} ek kazanç sağla.
            </Text>
          </View>
        </View>

        {/* ANA KATEGORİLER (Menü Seçenekleri) */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("WalletBalance")}>
            <View style={[styles.iconBox, {backgroundColor: '#E0F2F1'}]}>
              <Ionicons name="wallet-outline" size={24} color="#28A745" />
            </View>
            <Text style={styles.menuLabel}>Bakiyem</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("WithdrawMoney")}>
            <View style={[styles.iconBox, {backgroundColor: '#FFF4E5'}]}>
              <Ionicons name="cash-outline" size={24} color="#FF8C00" />
            </View>
            <Text style={styles.menuLabel}>Para Çek</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Bonuses")}>
            <View style={[styles.iconBox, {backgroundColor: '#EEF2FF'}]}>
              <Ionicons name="gift-outline" size={24} color="#003366" />
            </View>
            <Text style={styles.menuLabel}>Bonuslarım</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Yeni</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* SON İŞLEMLER */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Tümü</Text></TouchableOpacity>
        </View>

        {transactions.map((item) => (
          <View key={item.id} style={styles.transactionItem}>
            <View style={styles.transIcon}>
              <Ionicons 
                name={item.type === 'withdraw' ? "arrow-up-circle" : "arrow-down-circle"} 
                size={32} 
                color={item.type === 'withdraw' ? "#EF4444" : "#28A745"} 
              />
            </View>
            <View style={styles.transDetails}>
              <Text style={styles.transTitle}>{item.title}</Text>
              <Text style={styles.transDate}>{item.date}</Text>
            </View>
            <Text style={[
              styles.transAmount, 
              { color: item.type === 'withdraw' ? "#EF4444" : "#28A745" }
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
  scrollContent: { padding: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
  balanceCard: {
    backgroundColor: '#003366',
    borderRadius: 24,
    padding: 25,
    width: '100%',
    shadowColor: '#003366',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 30
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  currency: { color: '#28A745', fontSize: 24, fontWeight: 'bold', marginLeft: 8, marginBottom: 6 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  streakText: { color: '#FFF', fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 18 },
  // MENÜ STİLLERİ
  menuContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    paddingVertical: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  badge: { backgroundColor: '#28A745', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 10 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  // GEÇMİŞ STİLLERİ
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366' },
  seeAll: { color: '#64748B', fontSize: 14 },
  transactionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  transIcon: { marginRight: 15 },
  transDetails: { flex: 1 },
  transTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  transDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: 'bold' }
});