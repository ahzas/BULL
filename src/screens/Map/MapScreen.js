// src/screens/Map/MapScreen.js
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { JobContext } from "../../context/JobContext";

const { width, height } = Dimensions.get("window");
import API_BASE from "../../config/api";

export default function MapScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { jobs } = useContext(JobContext);
  const userData = user?.user || user;

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isEmployer = userData?.role === "employer";

  // Konum al ve sunucuya gönder
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni reddedildi. Harita çalışamaz.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Konumu sunucuya kaydet
      const userId = userData?._id || userData?.id;
      if (userId) {
        try {
          await axios.put(`${API_BASE}/users/update-location`, {
            userId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (e) {
          console.log("Konum güncelleme hatası:", e.message);
        }
      }
    })();
  }, []);

  // İşverense yakındaki işçileri çek
  const fetchNearbyWorkers = useCallback(async () => {
    if (!isEmployer) return;
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_BASE}/users/nearby-workers`);
      setNearbyWorkers(response.data || []);
    } catch (e) {
      console.log("Yakın işçi çekme hatası:", e.message);
    } finally {
      setRefreshing(false);
    }
  }, [isEmployer]);

  useEffect(() => {
    if (location && isEmployer) {
      fetchNearbyWorkers();
    }
  }, [location, isEmployer, fetchNearbyWorkers]);

  // Koordinatlı iş ilanlarını filtrele
  const jobsWithCoords = jobs.filter(
    (job) =>
      job.latitude &&
      job.longitude &&
      (job.type === "job_offer" || job.type === "job"),
  );

  // Yükleniyor ekranı
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <Text style={styles.loadingText}>Konumun Bulunuyor...</Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* İŞÇİ MODU: İş ilanlarını göster */}
        {!isEmployer &&
          jobsWithCoords.map((job, index) => (
            <Marker
              key={job._id || `job-${index}`}
              coordinate={{
                latitude: job.latitude,
                longitude: job.longitude,
              }}
              pinColor="#28A745"
            >
              <Callout onPress={() => navigation.navigate("JobDetail", { job })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{job.title}</Text>
                  <Text style={styles.calloutCompany}>{job.company}</Text>
                  <Text style={styles.calloutPrice}>{job.price} TL</Text>
                  <Text style={styles.calloutLocation}>📍 {job.location}</Text>
                </View>
              </Callout>
            </Marker>
          ))}

        {/* İŞVEREN MODU: Yakındaki işçileri göster */}
        {isEmployer &&
          nearbyWorkers.map((worker, index) => (
            <Marker
              key={worker._id || `worker-${index}`}
              coordinate={{
                latitude: worker.latitude,
                longitude: worker.longitude,
              }}
              pinColor="#003366"
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{worker.name}</Text>
                  <Text style={styles.calloutCompany}>
                    ⭐ {worker.rating?.toFixed(1) || "5.0"} Puan
                  </Text>
                  <Text style={styles.calloutPrice}>
                    🔥 {worker.streak || 0} Seri Gün
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {/* ÜST BİLGİ KARTI */}
      <View
        style={[styles.headerCard, isEmployer && styles.headerCardEmployer]}
      >
        <View style={styles.headerTop}>
          <Ionicons
            name={isEmployer ? "people" : "briefcase"}
            size={20}
            color={isEmployer ? "#003366" : "#28A745"}
          />
          <Text style={styles.greeting}>
            {isEmployer ? "Yakındaki İşçiler" : "Yakındaki İş İlanları"}
          </Text>
        </View>
        <Text style={styles.subtext}>
          {isEmployer
            ? `${nearbyWorkers.length} işçi konumunu paylaşıyor`
            : `${jobsWithCoords.length} ilan haritada görünüyor`}
        </Text>
      </View>

      {/* YENİLE BUTONU */}
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={isEmployer ? fetchNearbyWorkers : () => {}}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={20} color="#003366" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { marginTop: 10, color: "#EF4444", fontSize: 14 },
  loadingText: { marginTop: 10, color: "#64748B", fontSize: 14 },
  map: { width, height },
  headerCard: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#28A745",
  },
  headerCardEmployer: {
    borderLeftColor: "#003366",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greeting: { fontSize: 17, fontWeight: "800", color: "#003366" },
  subtext: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 28,
  },
  refreshBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 0,
    height: 0, // Hidden by default (overlay with header)
  },
  // Callout stilleri
  callout: { padding: 4, minWidth: 140 },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#003366",
    marginBottom: 2,
  },
  calloutCompany: { fontSize: 12, color: "#64748B" },
  calloutPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#28A745",
    marginTop: 4,
  },
  calloutLocation: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
});
