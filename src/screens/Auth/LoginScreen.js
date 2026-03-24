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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>BULL</Text>
          <Text style={styles.tagline}>Güçlü İş, Hızlı Çözüm</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@bull.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* BENİ HATIRLA & ŞİFREMİ UNUTTUM */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberBtn}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={22} 
                color={rememberMe ? "#28A745" : "#64748B"} 
              />
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
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#003366',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#475569',
    marginTop: 5,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#1E293B',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotBtn: {
    paddingVertical: 5,
  },
  forgotText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#28A745',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#28A745',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#64748B',
    fontSize: 15,
  },
  boldText: {
    color: '#003366',
    fontWeight: 'bold',
  },
});