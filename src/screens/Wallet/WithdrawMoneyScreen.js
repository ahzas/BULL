import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { WalletContext } from '../../context/WalletContext';
import { AuthContext } from '../../context/AuthContext';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WithdrawMoneyScreen({ navigation }) {
  const { balance, withdrawMoney, transactions } = useContext(WalletContext);
  const { user } = useContext(AuthContext);
  const [filterType, setFilterType] = useState('monthly');
  
  const getFullName = () => {
    const data = user?.user || user;
    if (data?.firstName && data?.lastName) {
      return `${data.firstName} ${data.lastName}`;
    }
    return data?.name || "Yusuf Berke Can";
  };
  const accountName = getFullName();
  const [amount, setAmount] = useState('');
  const availableBalance = balance.available || 0;

  const handleWithdrawal = () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir tutar girin.");
      return;
    }
    if (val > availableBalance) {
      Alert.alert("Hata", "Çekmek istediğiniz tutar kullanılabilir bakiyenizden büyük olamaz.");
      return;
    }

    withdrawMoney(val); // Context method invoking
    setAmount('');
    Alert.alert(
      "İşlem Başarılı", 
      `${val.toLocaleString('tr-TR')} TL tutarındaki çekim talebiniz alındı. Bir sonraki iş günü hesabınıza aktarılacaktır.`,
      [{ text: "Tamam" }]
    );
  };

  const withdrawals = transactions.filter(t => t.type === 'withdraw');
  const filteredWithdrawals = withdrawals.filter(t => {
    if (filterType === 'daily') return t.date === 'Bugün' || t.date === 'Şimdi';
    if (filterType === 'weekly') return t.date === 'Bugün' || t.date === 'Şimdi' || t.date === 'Dün' || t.date.includes('gün önce');
    return true; // monthly logs all recent ones in context
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Para Çek</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* MİKTAR GİRİŞİ */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Çekilecek Tutar</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₺</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                value={amount}
                onChangeText={setAmount}
                maxLength={8}
              />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.availableText}>Kullanılabilir: {availableBalance} ₺</Text>
              <TouchableOpacity onPress={() => setAmount(availableBalance.toString())}>
                <Text style={styles.withdrawAllBtn}>Tümünü Çek</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* HESAP SEÇİMİ */}
          <Text style={styles.sectionTitle}>Aktarılacak Hesap</Text>
          <TouchableOpacity style={styles.bankCard}>
            <View style={styles.bankIcon}>
              <Ionicons name="card" size={24} color="#003366" />
            </View>
            <View style={styles.bankDetails}>
              <Text style={styles.bankName}>Garanti BBVA</Text>
              <Text style={styles.ibanText}>TR45 **** **** **** **** 4567 12</Text>
              <Text style={styles.accountHolder}>{accountName}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#28A745" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addBankBtn}>
            <Ionicons name="add" size={18} color="#6366F1" />
            <Text style={styles.addBankText}>Yeni Hesap / IBAN Ekle</Text>
          </TouchableOpacity>

          {/* BİLGİLENDİRME */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#28A745" />
            <Text style={styles.infoText}>
              Banka hesabınızın adınıza kayıtlı olduğundan emin olun. Başkasına ait IBAN'lara yapılan ödemeler reddedilir.
            </Text>
          </View>

          {/* İŞLEM GEÇMİŞİ FİLTRESİ */}
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionTitle}>Çekim Geçmişi</Text>
          </View>
          <View style={styles.filterTabs}>
            <TouchableOpacity 
              style={[styles.filterTab, filterType === 'daily' && styles.filterTabActive]}
              onPress={() => setFilterType('daily')}
            >
              <Text style={[styles.filterTabText, filterType === 'daily' && styles.filterTabTextActive]}>Günlük</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, filterType === 'weekly' && styles.filterTabActive]}
              onPress={() => setFilterType('weekly')}
            >
              <Text style={[styles.filterTabText, filterType === 'weekly' && styles.filterTabTextActive]}>Haftalık</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, filterType === 'monthly' && styles.filterTabActive]}
              onPress={() => setFilterType('monthly')}
            >
              <Text style={[styles.filterTabText, filterType === 'monthly' && styles.filterTabTextActive]}>Aylık</Text>
            </TouchableOpacity>
          </View>

          {/* İŞLEM LİSTESİ */}
          <View style={styles.historyList}>
            {filteredWithdrawals.length > 0 ? (
              filteredWithdrawals.map(item => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemIcon}>
                    <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.historyItemDetails}>
                    <Text style={styles.historyItemTitle}>{item.title}</Text>
                    <Text style={styles.historyItemDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyItemAmount}>{item.amount}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="receipt-outline" size={32} color="#CBD5E1" />
                <Text style={styles.emptyHistoryText}>Bu döneme ait işlem bulunmuyor.</Text>
              </View>
            )}
          </View>

        </ScrollView>

        {/* ONAY BUTONU */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleWithdrawal}>
            <Text style={styles.confirmText}>Çekim Talebi Oluştur</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
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

  amountContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  amountLabel: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 15 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currencySymbol: { fontSize: 40, fontWeight: 'bold', color: '#1E293B', marginRight: 10, marginTop: -5 },
  amountInput: {
    fontSize: 48,
    fontWeight: '900',
    color: '#003366',
    minWidth: 100,
    textAlign: 'center'
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  availableText: { fontSize: 13, color: '#64748B' },
  withdrawAllBtn: { fontSize: 13, fontWeight: 'bold', color: '#4F46E5', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#28A745',
    marginBottom: 12
  },
  bankIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  bankDetails: { flex: 1 },
  bankName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  ibanText: { fontSize: 13, color: '#64748B', marginTop: 4, letterSpacing: 1 },
  accountHolder: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6366F1',
    marginBottom: 30
  },
  addBankText: { marginLeft: 8, color: '#6366F1', fontWeight: '600', fontSize: 14 },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  infoText: { flex: 1, marginLeft: 12, color: '#166534', fontSize: 12, lineHeight: 18 },

  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  confirmBtn: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  historyHeaderRow: { marginTop: 30, marginBottom: 15 },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20
  },
  filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  filterTabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  filterTabText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  filterTabTextActive: { color: '#003366', fontWeight: 'bold' },

  historyList: { marginBottom: 30 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  historyItemIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyItemDetails: { flex: 1 },
  historyItemTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  historyItemDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  historyItemAmount: { fontSize: 15, fontWeight: 'bold', color: '#EF4444' },

  emptyHistory: { alignItems: 'center', padding: 30, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  emptyHistoryText: { marginTop: 10, fontSize: 13, color: '#94A3B8' }
});
