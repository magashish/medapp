import { useCallback, useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { I18nProvider, useI18n } from "@/i18n/context";
import { AuthProvider, useAuth } from "@/state/AuthContext";
import { ProfileProvider } from "@/state/ProfileContext";
import { logDose, registerDeviceToken } from "@/db/queries";
import { ensureNotificationSetup } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) onLayoutRootView();
  }, [fontsLoaded, onLayoutRootView]);

  useEffect(() => {
    ensureNotificationSetup().catch(() => {});
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <AuthProvider>
          <ProfileProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </ProfileProvider>
        </AuthProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const handledInitial = useRef(false);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data as
        | { scheduleId?: number; timeOfDay?: string }
        | undefined;
      if (!data?.scheduleId) return;

      const actionId = response.actionIdentifier;
      if (actionId === "TAKEN" || actionId === "SKIP") {
        await logDose(data.scheduleId, actionId === "TAKEN" ? "taken" : "skipped").catch(() => {});
      } else if (!handledInitial.current) {
        handledInitial.current = true;
        router.push("/(tabs)/today");
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!user || Platform.OS === "web") return;
    (async () => {
      try {
        const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
        await registerDeviceToken(expoPushToken, Platform.OS);
      } catch {
        // Push registration needs an EAS project set up; local notifications still work either way.
      }
    })();
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="profile/add"
        options={{ presentation: "modal", headerShown: true, title: t("addFamilyMember") }}
      />
      <Stack.Screen
        name="medicine/add"
        options={{ presentation: "modal", headerShown: true, title: t("addMedicine") }}
      />
    </Stack>
  );
}
