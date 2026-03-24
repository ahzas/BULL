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
  },
  {
    id: '2',
    title: 'Sadece Çalışarak Değil,\nKullanarak Kazan!',
    description: 'Önce emeğinin karşılığını al, sonra BULL ile kazancını katla. Her işlem sana puan olarak geri döner.',
    // Para / Kazanç simgesi
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/2488/2488749.png' },
  },
  {
    id: '3',
    title: 'Streak Yap, Kazancını Katla!',
    description: '1 ay içerisinde işlerinizi aksatmadan seri (streak) yaparak, aldığınız ücretin %10\'una varan ekstra bonus kazanın.',
    // Ateş / Streak simgesi
    image: { uri: 'https://cdn-icons-png.flaticon.com/512/426/426833.png' },
  },
];

const Slide = ({ item }) => {
  return (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        {/* Görsellerin boyutu ve modu ayarlandı */}
        <Image 
          source={item.image} 
          style={styles.image} 
          resizeMode="contain" 
        />
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
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <View style={{ marginBottom: 20 }}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <TouchableOpacity style={styles.btn} onPress={handleFinish}>
              <Text style={styles.btnText}>BAŞLAYALIM</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#003366' }]} 
                onPress={handleFinish}
              >
                <Text style={[styles.btnText, { color: '#003366' }]}>ATLA</Text>
              </TouchableOpacity>
              <View style={{ width: 15 }} />
              <TouchableOpacity style={styles.btn} onPress={goNextSlide}>
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
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
  },
  image: {
    width: width * 0.6,  // Görsel boyutu
    height: width * 0.6,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#003366',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
    height: 8,
    width: 10,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 3,
    borderRadius: 4,
  },
  indicatorActive: {
    backgroundColor: '#28A745',
    width: 30,
  },
  btn: {
    flex: 1,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});