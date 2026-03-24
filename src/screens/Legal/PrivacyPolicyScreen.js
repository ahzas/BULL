// src/screens/Legal/PrivacyPolicyScreen.js
import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LAST_UPDATED = "20 Mart 2026";

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color="#28A745" />
          <Text style={styles.badgeText}>Son güncelleme: {LAST_UPDATED}</Text>
        </View>

        <Text style={styles.intro}>
          BULL olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu
          politika, verilerinizin nasıl toplandığını, kullanıldığını ve
          korunduğunu açıklar.
        </Text>

        {/* 1 */}
        <Text style={styles.sectionTitle}>1. Toplanan Veriler</Text>
        <Text style={styles.paragraph}>
          Uygulamayı kullanırken aşağıdaki veriler toplanabilir:{"\n\n"}
          <Text style={styles.bold}>Kimlik Bilgileri:</Text> Ad soyad, e-posta
          adresi, doğum tarihi{"\n"}
          <Text style={styles.bold}>Hesap Bilgileri:</Text> Şifre (şifreli
          olarak saklanır), hesap türü (işçi/işveren){"\n"}
          <Text style={styles.bold}>İş Verileri:</Text> Yayınlanan ilanlar,
          başvurular, yetenek profilleri{"\n"}
          <Text style={styles.bold}>Konum Verileri:</Text> Yalnızca izin
          verildiğinde, yakındaki iş ilanlarını göstermek için{"\n"}
          <Text style={styles.bold}>Cihaz Bilgileri:</Text> İşletim sistemi,
          uygulama sürümü ve bildirim tokenleri
        </Text>

        {/* 2 */}
        <Text style={styles.sectionTitle}>2. Verilerin Kullanım Amacı</Text>
        <Text style={styles.paragraph}>
          Toplanan veriler aşağıdaki amaçlarla kullanılır:{"\n\n"}• Hesap
          oluşturma ve kimlik doğrulama{"\n"}• İş eşleştirme ve ilan önerisi
          {"\n"}• Bildirim gönderimi (iş uyarıları, mesajlar){"\n"}• Komisyon
          hesaplama ve ödeme işlemleri{"\n"}• Uygulama performans analizi ve
          hata takibi{"\n"}• Yasal yükümlülüklerin yerine getirilmesi
        </Text>

        {/* 3 */}
        <Text style={styles.sectionTitle}>3. Veri Güvenliği</Text>
        <Text style={styles.paragraph}>
          Verilerinizin güvenliği için aldığımız önlemler:{"\n\n"}
          🔒 SSL/TLS şifreleme ile veri iletimi{"\n"}
          🔐 Şifrelerin hash algoritmaları ile korunması{"\n"}
          🛡️ MongoDB Atlas altyapısında güvenli veri depolama{"\n"}
          📊 Düzenli güvenlik güncellemeleri ve izleme{"\n"}
          🚫 Yetkisiz erişim tespit ve engelleme sistemleri
        </Text>

        {/* 4 */}
        <Text style={styles.sectionTitle}>4. Veri Paylaşımı</Text>
        <Text style={styles.paragraph}>
          Kişisel verileriniz{" "}
          <Text style={styles.bold}>üçüncü taraflarla satılmaz.</Text> Veriler
          yalnızca şu durumlarda paylaşılabilir:{"\n\n"}• İşveren-işçi
          eşleştirmesi kapsamında (ad, yetenek profili gibi gerekli bilgiler)
          {"\n"}• Yasal zorunluluk halinde (mahkeme kararı, resmi talep){"\n"}•
          Ödeme işlemleri için banka/ödeme altyapı sağlayıcılarıyla{"\n"}•
          Anonim ve toplu istatistiksel analizler için (kişisel kimlik içermez)
        </Text>

        {/* 5 */}
        <Text style={styles.sectionTitle}>5. Bildirim Yönetimi</Text>
        <Text style={styles.paragraph}>
          • Anlık bildirimler cihaz izninize bağlıdır; Ayarlar ekranından
          kontrol edebilirsiniz.{"\n"}• E-posta bildirimleri uygulama içi
          tercihlerden açılıp kapatılabilir.{"\n"}• İş uyarıları tercihinize
          göre özelleştirilebilir.{"\n"}• Bildirim tokeniniz yalnızca size
          bildirim göndermek için kullanılır.
        </Text>

        {/* 6 */}
        <Text style={styles.sectionTitle}>6. Konum Verileri</Text>
        <Text style={styles.paragraph}>
          • Konum verisi yalnızca siz izin verdiğinizde toplanır.{"\n"}• "Konum
          Paylaşımı" kapalıyken hiçbir konum verisi işlenmez.{"\n"}• Konum
          verisi yalnızca yakındaki iş ilanlarını göstermek için kullanılır ve
          saklanmaz.
        </Text>

        {/* 7 */}
        <Text style={styles.sectionTitle}>7. Kullanıcı Hakları</Text>
        <Text style={styles.paragraph}>
          KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında şu haklara
          sahipsiniz:{"\n\n"}✅ Verilerinize erişim hakkı{"\n"}✅ Verilerinizin
          düzeltilmesini talep etme hakkı{"\n"}✅ Verilerinizin silinmesini
          talep etme hakkı{"\n"}✅ Veri işleme amacını öğrenme hakkı{"\n"}✅
          İtiraz etme ve şikayette bulunma hakkı{"\n\n"}
          Bu haklarınızı kullanmak için destek@bull.app adresine
          başvurabilirsiniz.
        </Text>

        {/* 8 */}
        <Text style={styles.sectionTitle}>8. Çerezler ve Analitik</Text>
        <Text style={styles.paragraph}>
          Mobil uygulamamızda tarayıcı çerezleri kullanılmaz. Ancak uygulama
          performansını iyileştirmek için anonim kullanım istatistikleri
          toplanabilir. Bu veriler kişisel kimliğinizle ilişkilendirilmez.
        </Text>

        {/* 9 */}
        <Text style={styles.sectionTitle}>9. Politika Değişiklikleri</Text>
        <Text style={styles.paragraph}>
          Bu gizlilik politikası, yasal gereklilikler veya hizmet değişiklikleri
          sebebiyle güncellenebilir. Önemli değişiklikler uygulama içi bildirim
          ve/veya e-posta yoluyla duyurulacaktır.
        </Text>

        {/* 10 */}
        <Text style={styles.sectionTitle}>10. İletişim</Text>
        <Text style={styles.paragraph}>
          Gizlilik politikamız hakkında sorularınız için:{"\n\n"}
          📧 destek@bull.app{"\n"}
          📧 kvkk@bull.app{"\n"}
          📱 Uygulama içi Yardım ve Destek menüsü
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 BULL. Tüm hakları saklıdır.
          </Text>
          <Text style={styles.footerSubtext}>
            KVKK ve 6698 sayılı Kanun kapsamında düzenlenmiştir.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#003366" },
  content: { padding: 24, paddingBottom: 40 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F0FFF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#28A745" },
  intro: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "400",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003366",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  bold: { fontWeight: "700", color: "#1E293B" },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  footerText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  footerSubtext: { fontSize: 10, color: "#CBD5E1", marginTop: 4 },
});
