// src/screens/Profile/ChangePasswordScreen.js
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

import API_BASE from "../../config/api";

// PasswordInput bileşeni ana fonksiyonun DIŞINDA tanımlanmalı
// Aksi halde her render'da yeniden oluşturulur ve TextInput focus kaybeder (klavye kapanır)
const PasswordInput = ({
  label,
  value,
  onChangeText,
  showPassword,
  toggleShow,
  placeholder,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons
        name="lock-closed-outline"
        size={18}
        color="#94A3B8"
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#94A3B8"
        />
      </TouchableOpacity>
    </View>
  </View>
);

export default function ChangePasswordScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const userData = user?.user || user;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Yeni şifre ve tekrarı eşleşmiyor.");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Hata", "Yeni şifre mevcut şifreden farklı olmalıdır.");
      return;
    }

    const userId = userData?._id || userData?.id;
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE}/users/change-password`, {
        userId,
        currentPassword,
        newPassword,
      });

      if (response.data?.message) {
        Alert.alert("Başarılı", response.data.message, [
          { text: "Tamam", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Şifre değiştirilemedi.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Şifre Değiştir</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Güvenlik ikonu */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={40} color="#003366" />
            <Text style={styles.securityTitle}>Güvenli Şifre Değişikliği</Text>
            <Text style={styles.securitySubtitle}>
              Hesabınızın güvenliği için güçlü bir şifre belirleyin
            </Text>
          </View>

          <PasswordInput
            label="Mevcut Şifre"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            showPassword={showCurrent}
            toggleShow={() => setShowCurrent(!showCurrent)}
            placeholder="Mevcut şifrenizi girin"
          />

          <PasswordInput
            label="Yeni Şifre"
            value={newPassword}
            onChangeText={setNewPassword}
            showPassword={showNew}
            toggleShow={() => setShowNew(!showNew)}
            placeholder="En az 6 karakter"
          />

          <PasswordInput
            label="Yeni Şifre (Tekrar)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            showPassword={showConfirm}
            toggleShow={() => setShowConfirm(!showConfirm)}
            placeholder="Yeni şifreyi tekrar girin"
          />

          {/* Şifre gücü ipuçları */}
          <View style={styles.tipBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#64748B"
            />
            <Text style={styles.tipText}>
              En az 6 karakter ve mevcut şifrenizden farklı olmalıdır
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="key" size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Şifreyi Güncelle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: { padding: 24 },
  securityBadge: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#1B2E4B",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D21",
    marginTop: 12,
  },
  securitySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A5568",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E8E4DE",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: "#1A1D21",
  },
  eyeBtn: { padding: 8 },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F1ED",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipText: { fontSize: 12, color: "#6B7280", flex: 1 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#003366",
    height: 56,
    borderRadius: 16,
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
});
