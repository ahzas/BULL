// App.js
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// VERİ HAVUZU (CONTEXT)
import { AuthProvider } from "./src/context/AuthContext";
import { JobProvider } from "./src/context/JobContext";

// EKRANLAR (AUTH)
import LoginScreen from "./src/screens/Auth/LoginScreen";
import OnboardingScreen from "./src/screens/Auth/OnboardingScreen";
import RegisterScreen from "./src/screens/Auth/RegisterScreen";

// EKRANLAR (ANA UYGULAMA)
import ApprovalsScreen from "./src/screens/Approvals/ApprovalsScreen";
import HomeScreen from "./src/screens/Home/HomeScreen";
import JobDetailScreen from "./src/screens/Home/JobDetailScreen";
import PostJobScreen from "./src/screens/Home/PostJobScreen";
import MapScreen from "./src/screens/Map/MapScreen";
import MyJobsScreen from "./src/screens/MyJobs/MyJobsScreen";
import ProfileScreen from "./src/screens/Profile/ProfileScreen";
import WalletScreen from "./src/screens/Wallet/WalletScreen";

// --- YENİ EKLENEN EKRANLAR ---
import PrivacyPolicyScreen from "./src/screens/Legal/PrivacyPolicyScreen";
import TermsScreen from "./src/screens/Legal/TermsScreen";
import BusinessProfileScreen from "./src/screens/Profile/BusinessProfileScreen";
import ChangePasswordScreen from "./src/screens/Profile/ChangePasswordScreen";
import SettingsScreen from "./src/screens/Profile/SettingsScreen";
import ActiveWorkersScreen from "./src/screens/Profile/ActiveWorkersScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 5'Lİ ALT MENÜ (APP TABS) ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#003366",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 16,
          shadowColor: "#1B2E4B",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Ana Sayfa") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Harita") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "İşlerim") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Onaylar") {
            iconName = focused
              ? "checkmark-done-circle"
              : "checkmark-done-circle-outline";
          } else if (route.name === "Cüzdan") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Profil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Harita" component={MapScreen} />
      <Tab.Screen name="İşlerim" component={MyJobsScreen} />
      <Tab.Screen name="Onaylar" component={ApprovalsScreen} />
      <Tab.Screen name="Cüzdan" component={WalletScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- ANA NAVİGASYON (ROOT STACK) ---
export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                animation: "slide_from_right",
              }}
            >
              {/* Kimlik Doğrulama Ekranları */}
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />

              {/* Ana Uygulama (Alt Menü) */}
              <Stack.Screen name="HomeApp" component={AppTabs} />

              {/* Alt Menü Dışında Kalan (Full-Screen) Ekranlar */}
              <Stack.Screen name="JobDetail" component={JobDetailScreen} />
              <Stack.Screen name="PostJob" component={PostJobScreen} />

              {/* --- YENİ EKLENEN NAVİGASYON ROTALARI --- */}
              <Stack.Screen
                name="BusinessProfile"
                component={BusinessProfileScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Terms"
                component={TermsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Privacy"
                component={PrivacyPolicyScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ActiveWorkers"
                component={ActiveWorkersScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </JobProvider>
    </AuthProvider>
  );
}
