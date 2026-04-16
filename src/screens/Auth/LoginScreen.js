// src/screens/Auth/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  // Uygulama açıldığında hafızadaki e-postayı kontrol et
  useEffect(() => {
    const checkRememberedUser = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('@user_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Hafıza okuma hatası:", error);
      }
    };
    checkRememberedUser();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    const result = await login(email, password); 
    setLoading(false);

    if (result?.success) {
      // Beni Hatırla Mantığı
      try {
        if (rememberMe) {
          await AsyncStorage.setItem('@user_email', email);
        } else {
          await AsyncStorage.removeItem('@user_email');
        }
      } catch (err) {
        console.log("Hafıza yazma hatası:", err);
      }
      
      navigation.replace('HomeApp'); 
    } else {
      Alert.alert("Giriş Başarısız", result?.message || "Hata oluştu.");
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* Üst Koyu Alan - Marka Kimliği */}
      <View style={styles.brandSection}>
        <SafeAreaView edges={['top']}>
          <View style={styles.brandContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.appName}>BULL</Text>
            <Text style={styles.tagline}>Güçlü İş, Hızlı Çözüm</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Alt Form Alanı */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formSection}
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Hesabına Giriş Yap</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#8C95A3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ornek@bull.com"
                placeholderTextColor="#B8BEC7"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#8C95A3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor="#B8BEC7"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#8C95A3" />
              </TouchableOpacity>
            </View>
          </View>

          {/* BENİ HATIRLA & ŞİFREMİ UNUTTUM */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberBtn}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.rememberText}>Beni Hatırla</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={() => Alert.alert("Bilgi", "Şifre sıfırlama yakında!")}
            >
              <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Giriş Yap</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Hesabın yok mu? <Text style={styles.boldText}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#003366',
  },
  brandSection: {
    paddingBottom: 30,
  },
  brandContent: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#F6F4F0',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formCard: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1D21',
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#4A5568',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1A1D21',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 2,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD2DA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  rememberText: {
    marginLeft: 10,
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotBtn: {
    paddingVertical: 5,
  },
  forgotText: {
    color: '#003366',
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#28A745',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B7A30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  linkButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  linkText: {
    color: '#4A5568',
    fontSize: 15,
  },
  boldText: {
    color: '#003366',
    fontWeight: '800',
  },
});