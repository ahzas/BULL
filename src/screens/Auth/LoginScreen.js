// src/screens/Auth/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* LOGO ALANI */}
        <View style={styles.logoArea}>
          <Image source={require('../../../assets/images/bull-logo.png')} style={styles.logoImg} />
          <Text style={styles.logoName}>BULL</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>E-posta</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresinizi girin"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Şifre</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(!rememberMe)}>
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={20} 
                color={rememberMe ? "#003366" : "#ccc"} 
              />
              <Text style={styles.checkLabel}>Beni Hatırla</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert("Bilgi", "Şifre sıfırlama yakında!")}>
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && { opacity: 0.6 }]} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ALT LİNK */}
        <View style={styles.bottom}>
          <Text style={styles.bottomText}>Hesabınız yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.bottomLink}> Üye Ol</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  logoArea: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logoImg: { width: 80, height: 80, borderRadius: 16 },
  logoName: { fontSize: 24, fontWeight: '900', color: '#003366', marginTop: 10, letterSpacing: 3 },
  form: { paddingHorizontal: 24 },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, height: 48, backgroundColor: '#FAFAFA',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkLabel: { fontSize: 14, color: '#555' },
  forgotText: { fontSize: 14, color: '#003366', fontWeight: '600' },
  loginBtn: {
    backgroundColor: '#003366', height: 50, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  bottom: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', marginBottom: 30 },
  bottomText: { fontSize: 15, color: '#666' },
  bottomLink: { fontSize: 15, color: '#003366', fontWeight: '700' },
});