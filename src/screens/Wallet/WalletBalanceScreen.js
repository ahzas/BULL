import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WalletContext } from '../../context/WalletContext';

export default function WalletBalanceScreen({ navigation }) {
  const { balance } = useContext(WalletContext);

  const incomeSources = [
    { id: '1', title: 'Tamamlanan İşler', amount: '3.900 TL', percent: 82, color: '#003366' },
    { id: '2', title: 'Seri (Streak) Bonusları', amount: '850 TL', percent: 18, color: '#28A745' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bakiye Özeti</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ANA BAKİYE KARTI */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Kullanılabilir Bakiye</Text>
          <View style={styles.heroAmountRow}>
            <Text style={styles.heroAmount}>{(balance.available || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.heroCurrency}>₺</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroFooter}>
            <View style={styles.heroSubItem}>
              <Text style={styles.heroSubLabel}>Bekleyen / Bloke</Text>
              <Text style={styles.heroSubValue}>{(balance.pending || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
            </View>
            <View style={styles.heroSubDivider} />
            <View style={styles.heroSubItem}>
              <Text style={styles.heroSubLabel}>Toplam Varlık</Text>
              <Text style={[styles.heroSubValue, { color: '#FFF' }]}>{(balance.total || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
            </View>
          </View>
        </View>

        {/* BU AYKİ ÇEKİMLER */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBox}>
            <Ionicons name="calendar-outline" size={24} color="#6366F1" />
          </View>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoTitle}>Bu Ay Çekilen Tutar</Text>
            <Text style={styles.infoSubtitle}>Bankanıza aktarılan toplam tutar</Text>
          </View>
          <Text style={styles.infoAmount}>{(balance.withdrawnThisMonth || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
        </View>

        {/* GELİR DAĞILIMI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gelir Dağılımı</Text>
        </View>

        <View style={styles.chartCard}>
          {/* Sahte İlerleme Çubuğu */}
          <View style={styles.barContainer}>
            {incomeSources.map(source => (
              <View key={source.id} style={[styles.barSegment, { flex: source.percent, backgroundColor: source.color }]} />
            ))}
          </View>

          {/* Kaynak Listesi */}
          <View style={styles.sourceList}>
            {incomeSources.map(source => (
              <View key={source.id} style={styles.sourceItem}>
                <View style={styles.sourceLeft}>
                  <View style={[styles.sourceDot, { backgroundColor: source.color }]} />
                  <Text style={styles.sourceText}>{source.title}</Text>
                </View>
                <View style={styles.sourceRight}>
                  <Text style={styles.sourceAmount}>{source.amount}</Text>
                  <Text style={styles.sourcePercent}>%{source.percent}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* UYARI / BİLGİ */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
          <Text style={styles.disclaimerText}>
            Uygulama üzerindeki bakiyeleriniz banka hesaplarınıza her Pazartesi otomatik olarak aktarılmaktadır. İsterseniz "Para Çek" menüsünden manuel işlem yapabilirsiniz.
          </Text>
        </View>

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
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  heroCard: {
    backgroundColor: '#003366',
    borderRadius: 24,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#003366',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  heroAmountRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  heroAmount: { color: '#FFF', fontSize: 38, fontWeight: '900' },
  heroCurrency: { color: '#28A745', fontSize: 24, fontWeight: 'bold', marginLeft: 8, marginBottom: 6 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroSubItem: { flex: 1 },
  heroSubLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 },
  heroSubValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  heroSubDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 15 },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  infoIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  infoTextBox: { flex: 1, marginLeft: 15 },
  infoTitle: { color: '#1E293B', fontSize: 15, fontWeight: 'bold' },
  infoSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
  infoAmount: { color: '#4F46E5', fontSize: 16, fontWeight: '900' },

  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },

  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 25,
  },
  barContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20
  },
  barSegment: { height: '100%' },
  sourceList: {},
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  sourceLeft: { flexDirection: 'row', alignItems: 'center' },
  sourceDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  sourceText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  sourceRight: { alignItems: 'flex-end' },
  sourceAmount: { color: '#1E293B', fontSize: 14, fontWeight: 'bold' },
  sourcePercent: { color: '#94A3B8', fontSize: 12, marginTop: 2 },

  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'flex-start'
  },
  disclaimerText: { flex: 1, marginLeft: 10, color: '#64748B', fontSize: 12, lineHeight: 18 }
});
