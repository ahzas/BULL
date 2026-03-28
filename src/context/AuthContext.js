import axios from "axios";
import { createContext, useState } from "react";

export const AuthContext = createContext();

import API_BASE from "../config/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/users/login`, {
        email,
        password,
      });

      if (response.data) {
        const userData = response.data.user || response.data;
        setUser(userData);
        setIsLoggedIn(true);
        return { success: true };
      }
    } catch (error) {
      console.error("Giriş Hatası:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Giriş başarısız!",
      };
    }
  };

  const updateUser = async (updateData) => {
    try {
      const userData = user?.user || user;
      const userId = userData?._id || userData?.id;

      if (!userId) {
        return { success: false, message: "Kullanıcı ID bulunamadı." };
      }

      const response = await axios.put(`${API_BASE}/users/update`, {
        userId,
        ...updateData,
      });

      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: "Güncelleme yanıtı alınamadı." };
    } catch (error) {
      console.error(
        "Güncelleme Hatası:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message: error.response?.data?.message || "Güncelleme başarısız!",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
