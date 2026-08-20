import { useCallback, useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { I18nProvider, useI18n } from "@/i18n/context";
import { ProfileProvider } from "@/state/ProfileContext";
import { logDose } from "@/db/queries";
import { todayDateString } from "@/lib/date";
import { ensureNotificationSetup } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const handledInitial = useRef(false);

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

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data as
        | { scheduleId?: number; medicineId?: number; profileId?: number; timeOfDay?: string }
        | undefined;
      if (!data?.scheduleId || !data.medicineId || !data.profileId || !data.timeOfDay) return;

      const actionId = response.actionIdentifier;
      if (actionId === "TAKEN" || actionId === "SKIP") {
        await logDose({
          scheduleId: data.scheduleId,
          medicineId: data.medicineId,
          profileId: data.profileId,
          doseDate: todayDateString(),
          timeOfDay: data.timeOfDay,
          status: actionId === "TAKEN" ? "taken" : "skipped",
        });
      } else if (!handledInitial.current) {
        handledInitial.current = true;
        router.push("/(tabs)/today");
      }
    });
    return () => sub.remove();
  }, [router]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <ProfileProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </ProfileProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const { t } = useI18n();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
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
