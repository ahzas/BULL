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
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { JobContext } from "../../context/JobContext";
import API_BASE from "../../config/api";

const { width, height } = Dimensions.get("window");

export default function MapScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { jobs } = useContext(JobContext);
  const userData = user?.user || user;

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);

  const isEmployer = userData?.role === "employer";

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Konum izni reddedildi.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

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

  const fetchNearbyWorkers = useCallback(async () => {
    if (!isEmployer) return;
    try {
      const response = await axios.get(`${API_BASE}/users/nearby-workers`);
      setNearbyWorkers(response.data || []);
    } catch (e) {
      console.log("Yakın işçi çekme hatası:", e.message);
    }
  }, [isEmployer]);

  useEffect(() => {
    if (location && isEmployer) fetchNearbyWorkers();
  }, [location, isEmployer, fetchNearbyWorkers]);

  const jobsWithCoords = jobs.filter(
    (job) => job.latitude && job.longitude && (job.type === "job_offer" || job.type === "job"),
  );

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28A745" />
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
              onCalloutPress={() => navigation.navigate("JobDetail", { job })}
            >
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{job.title}</Text>
                  <Text style={styles.calloutCompany}>{job.company}</Text>
                  <Text style={styles.calloutPrice}>{job.price} ₺</Text>
                  <Text style={styles.calloutHint}>Detay için dokunun →</Text>
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
      <View style={styles.headerCard}>
        <Ionicons
          name={isEmployer ? "people" : "briefcase"}
          size={18}
          color="#28A745"
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isEmployer ? "Yakındaki İşçiler" : "Yakındaki İlanlar"}
          </Text>
          <Text style={styles.headerSub}>
            {isEmployer
              ? `${nearbyWorkers.length} işçi konumunu paylaşıyor`
              : `${jobsWithCoords.length} ilan haritada`}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  errorText: { marginTop: 10, color: "#E53935", fontSize: 14 },
  loadingText: { marginTop: 10, color: "#888", fontSize: 14 },
  map: { width, height },
  // ÜST KART
  headerCard: {
    position: "absolute", top: 56, left: 12, right: 12,
    backgroundColor: "#FFF", borderRadius: 10,
    padding: 14, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: '#EBEBEB',
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#222" },
  headerSub: { fontSize: 12, color: "#888", marginTop: 1 },
  // CALLOUT
  callout: { padding: 6, minWidth: 150 },
  calloutTitle: { fontSize: 14, fontWeight: "700", color: "#222", marginBottom: 2 },
  calloutCompany: { fontSize: 12, color: "#888" },
  calloutPrice: { fontSize: 14, fontWeight: "700", color: "#28A745", marginTop: 4 },
  calloutHint: { fontSize: 11, color: "#28A745", marginTop: 4, fontWeight: '500' },
});
