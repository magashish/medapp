import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { FamilyIllustration } from "@/components/FamilyIllustration";
import { useProfiles } from "@/state/ProfileContext";
import { useAuth } from "@/state/AuthContext";
import { useI18n } from "@/i18n/context";
import { colors, radius, spacing, type } from "@/theme";

export default function Welcome() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profiles, loading: profilesLoading } = useProfiles();
  const { t, lang, setLang } = useI18n();
  const { width: windowWidth } = useWindowDimensions();

  if (authLoading) return null;
  if (!user) return <Redirect href="/login" />;
  if (profilesLoading) return null;
  if (profiles.length > 0) return <Redirect href="/(tabs)/today" />;

  const illustrationWidth = Math.min(340, windowWidth - spacing.xl * 2 - spacing.lg * 2);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.langRow}>
        <Button
          label="English"
          variant={lang === "en" ? "primary" : "secondary"}
          onPress={() => setLang("en")}
        />
        <Button label="हिंदी" variant={lang === "hi" ? "primary" : "secondary"} onPress={() => setLang("hi")} />
      </View>

      <View style={styles.hero}>
        <View style={styles.illustrationCard}>
          <FamilyIllustration width={illustrationWidth} />
        </View>
        <Text style={[type.display, styles.title]}>{t("appName")}</Text>
        <Text style={[type.h3, styles.tagline]}>{t("tagline")}</Text>
        <Text style={[type.body, styles.desc]}>{t("heroDesc")}</Text>
      </View>

      <View style={styles.features}>
        <Feature icon="notifications" text={t("featureReminders")} />
        <Feature icon="people" text={t("featureFamily")} />
        <Feature icon="stats-chart" text={t("featureAdherence")} />
      </View>

      <Button
        label={t("getStarted")}
        size="lg"
        fullWidth
        icon="arrow-forward"
        onPress={() => router.push("/profile/add?first=1")}
      />
    </Screen>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[type.body, { color: colors.textMuted, flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  langRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  illustrationCard: {
    width: "100%",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
  },
  tagline: {
    color: colors.primary,
    textAlign: "center",
  },
  desc: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  features: {
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
