import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useI18n } from "@/i18n/context";
import { useProfiles } from "@/state/ProfileContext";
import { ensureNotificationSetup } from "@/lib/notifications";
import { colors, radius, spacing, type } from "@/theme";

export default function Settings() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const { profiles, activeProfile, setActiveProfileId } = useProfiles();

  return (
    <Screen>
      <Text style={type.h1}>{t("settings")}</Text>

      <Card>
        <Text style={[type.smallMedium, { color: colors.textMuted, marginBottom: spacing.md }]}>
          {t("language")}
        </Text>
        <View style={styles.langRow}>
          <Button label="English" variant={lang === "en" ? "primary" : "secondary"} onPress={() => setLang("en")} />
          <Button label="हिंदी" variant={lang === "hi" ? "primary" : "secondary"} onPress={() => setLang("hi")} />
        </View>
      </Card>

      <Card>
        <View style={styles.familyHeader}>
          <Text style={[type.smallMedium, { color: colors.textMuted }]}>{t("yourFamily")}</Text>
          <Pressable onPress={() => router.push("/profile/add")}>
            <Ionicons name="add-circle" size={26} color={colors.primary} />
          </Pressable>
        </View>
        {profiles.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setActiveProfileId(p.id)}
            style={[styles.profileRow, p.id === activeProfile?.id && styles.profileRowActive]}
          >
            <View style={[styles.avatar, { backgroundColor: p.color }]}>
              <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyMedium}>{p.name}</Text>
              <Text style={[type.small, { color: colors.textMuted }]}>{t(p.relation)}</Text>
            </View>
            {p.id === activeProfile?.id ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            ) : null}
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={styles.notifRow}>
          <Ionicons name="notifications" size={22} color={colors.primary} />
          <Text style={[type.small, { color: colors.textMuted, flex: 1 }]}>
            {t("notificationsPermission")}
          </Text>
        </View>
        <Button
          label={t("enableNotifications")}
          variant="secondary"
          icon="notifications-outline"
          onPress={() => ensureNotificationSetup()}
          style={{ marginTop: spacing.md }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  familyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  profileRowActive: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...type.smallMedium,
    color: colors.white,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
