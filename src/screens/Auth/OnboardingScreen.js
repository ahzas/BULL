// src/screens/Auth/OnboardingScreen.js
import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// SLAYT İÇERİKLERİ (İnternet görselleriyle güncellendi)
const SLIDES = [
  {
    id: '1',
    title: 'BULL ile Kazanmaya\nHoş Geldiniz!',
    description: 'Güçlü iş gücü, hızlı kazanç dünyasına ilk adımınızı attınız.',
    // Boğa / Güç simgesi
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/2534/2534674.png' }, 
    accentColor: '#003366',
  },
  {
    id: '2',
    title: 'Sadece Çalışarak Değil,\nKullanarak Kazan!',
    description: 'Önce emeğinin karşılığını al, sonra BULL ile kazancını katla. Her işlem sana puan olarak geri döner.',
    // Para / Kazanç simgesi
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/2488/2488749.png' },
    accentColor: '#28A745',
  },
  {
    id: '3',
    title: 'Streak Yap,\nKazancını Katla!',
    description: '1 ay içerisinde işlerinizi aksatmadan seri yaparak, aldığınız ücretin %10\'una varan ekstra bonus kazanın.',
    // Ateş / Streak simgesi
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/426/426833.png' },
    accentColor: '#E67E22',
  },
];

const Slide = ({ item }) => {
  return (
    <View style={styles.slide}>
      <View style={[styles.imageContainer, { backgroundColor: item.accentColor + '08' }]}>
        {/* Görsellerin boyutu ve modu ayarlandı */}
        <View style={[styles.imageBg, { backgroundColor: item.accentColor + '12' }]}>
          <Image 
            source={item.image} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef(null);

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex !== SLIDES.length) {
      const offset = nextSlideIndex * width;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const handleFinish = () => {
    // Tanıtım bitince Giriş ekranına dön
    navigation.replace('HomeApp'); 
  };

  const currentAccent = SLIDES[currentSlideIndex]?.accentColor || '#003366';

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{ height: height * 0.75 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={SLIDES}
        pagingEnabled
        renderItem={({ item }) => <Slide item={item} />}
      />

      {/* ALT KISIM (Noktalar ve Buton) */}
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((slide, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && [styles.indicatorActive, { backgroundColor: currentAccent }],
              ]}
            />
          ))}
        </View>

        <View style={{ marginBottom: 20 }}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: currentAccent }]} 
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>BAŞLAYALIM</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                style={styles.skipBtn} 
                onPress={handleFinish}
              >
                <Text style={[styles.skipBtnText, { color: currentAccent }]}>ATLA</Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: currentAccent }]} 
                onPress={goNextSlide}
              >
                <Text style={styles.btnText}>İLERİ</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F4F0',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 24,
  },
  imageBg: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.35,
    height: width * 0.35,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#1A1D21',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
  },
  footer: {
    height: height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 6,
    width: 6,
    backgroundColor: '#DDDAD4',
    marginHorizontal: 4,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 28,
  },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  skipBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },
});