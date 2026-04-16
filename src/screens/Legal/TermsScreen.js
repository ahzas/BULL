// src/screens/Legal/TermsScreen.js
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

export default function TermsScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Kullanım Koşulları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Ionicons name="document-text" size={16} color="#003366" />
          <Text style={styles.badgeText}>Son güncelleme: {LAST_UPDATED}</Text>
        </View>

        <Text style={styles.intro}>
          BULL uygulamasını ("Uygulama") kullanarak aşağıdaki kullanım
          koşullarını kabul etmiş sayılırsınız. Lütfen bu koşulları dikkatlice
          okuyunuz.
        </Text>

        {/* 1 */}
        <Text style={styles.sectionTitle}>1. Hizmet Tanımı</Text>
        <Text style={styles.paragraph}>
          BULL, işverenler ile işçiler arasında günlük iş eşleştirmesi sağlayan
          bir mobil platformdur. Uygulama, iş ilanı yayınlama, iş başvurusu
          yapma, yetenek profili oluşturma ve ödeme takibi gibi hizmetler sunar.
        </Text>

        {/* 2 */}
        <Text style={styles.sectionTitle}>
          2. Hesap Oluşturma ve Sorumluluk
        </Text>
        <Text style={styles.paragraph}>
          • Uygulamayı kullanmak için geçerli bir e-posta adresi ile kayıt
          olmanız gerekmektedir.{"\n"}• Hesap bilgilerinizin doğruluğundan ve
          güvenliğinden siz sorumlusunuz.{"\n"}• Hesabınızda gerçekleşen tüm
          işlemlerden siz sorumlu tutulursunuz.{"\n"}• 18 yaşından küçükler
          uygulamayı kullanamaz.
        </Text>

        {/* 3 */}
        <Text style={styles.sectionTitle}>3. İş İlanları ve Başvurular</Text>
        <Text style={styles.paragraph}>
          • İşverenler, yalnızca yasal ve gerçek iş ilanları yayınlayabilir.
          {"\n"}• Yanıltıcı, sahte veya yasadışı içerikli ilanlar derhal
          kaldırılır.{"\n"}• İşçiler, yetenek profillerinde doğru ve güncel
          bilgi vermekle yükümlüdür.{"\n"}• BULL, ilanların doğruluğunu garanti
          etmez; taraflar arası anlaşmazlıklarda arabuluculuk sağlayabilir.
        </Text>

        {/* 4 */}
        <Text style={styles.sectionTitle}>4. Komisyon ve Ödemeler</Text>
        <Text style={styles.paragraph}>
          BULL, tamamlanan her işlem üzerinden çift taraflı komisyon alır.
          Komisyon oranları, kullanıcının "Ahde Vefa" seri gün sayısına göre
          kademeli olarak düşer:{"\n\n"}• Başlangıç (0-7 gün): İşveren %10, İşçi
          %5{"\n"}• Bronz (8-14 gün): İşveren %9, İşçi %4.5{"\n"}• Gümüş (15-29
          gün): İşveren %8, İşçi %4{"\n"}• Altın (30+ gün): İşveren %7, İşçi %3
          {"\n\n"}
          Her işlemde minimum 5₺ komisyon uygulanır.{"\n"}
          Ödemeler, platformun belirlediği yöntemlerle (IBAN, dijital cüzdan)
          gerçekleştirilir. Ödeme anlaşmazlıkları için BULL destek ekibine
          başvurabilirsiniz.
        </Text>

        {/* 5 */}
        <Text style={styles.sectionTitle}>5. Kullanıcı Davranışları</Text>
        <Text style={styles.paragraph}>
          Aşağıdaki davranışlar kesinlikle yasaktır:{"\n\n"}• Diğer
          kullanıcılara hakaret, tehdit veya tacizde bulunmak{"\n"}• Sahte hesap
          oluşturmak veya başka birinin kimliğini kullanmak{"\n"}• Platformu
          yasadışı faaliyetler için kullanmak{"\n"}• Uygulamanın güvenlik
          sistemlerini atlatmaya çalışmak{"\n\n"}
          Bu kurallara uymayan hesaplar uyarı veya kalıcı olarak kapatılabilir.
        </Text>

        {/* 6 */}
        <Text style={styles.sectionTitle}>6. Fikri Mülkiyet</Text>
        <Text style={styles.paragraph}>
          BULL uygulamasının tasarımı, logosu, yazılımı ve içeriği tescilli
          fikri mülkiyettir. İzinsiz kopyalama, çoğaltma veya dağıtım yasaktır.
        </Text>

        {/* 7 */}
        <Text style={styles.sectionTitle}>7. Sorumluluk Sınırlandırması</Text>
        <Text style={styles.paragraph}>
          BULL, platformda yayınlanan ilanların doğruluğundan, taraflar arası iş
          ilişkisinden doğan zararlardan veya hizmet kesintilerinden sorumlu
          tutulamaz. Uygulama "olduğu gibi" sunulmaktadır.
        </Text>

        {/* 8 */}
        <Text style={styles.sectionTitle}>8. Değişiklikler</Text>
        <Text style={styles.paragraph}>
          BULL, bu kullanım koşullarını önceden bildirimde bulunarak değiştirme
          hakkını saklı tutar. Güncellenen koşullar uygulama içinden duyurulacak
          ve yürürlüğe girdiği tarihten itibaren geçerli olacaktır.
        </Text>

        {/* 9 */}
        <Text style={styles.sectionTitle}>9. İletişim</Text>
        <Text style={styles.paragraph}>
          Kullanım koşullarıyla ilgili sorularınız için:{"\n\n"}
          📧 destek@bull.app{"\n"}
          📱 Uygulama içi Yardım ve Destek menüsü
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 BULL. Tüm hakları saklıdır.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F4F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F1ED",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1ED",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1A1D21" },
  content: { padding: 24, paddingBottom: 40 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
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
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  footerText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
});
