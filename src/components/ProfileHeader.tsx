import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useProfiles } from "@/state/ProfileContext";
import { useI18n } from "@/i18n/context";
import { colors, radius, spacing, type } from "@/theme";

export function ProfileHeader({ subtitle }: { subtitle?: string }) {
  const { activeProfile } = useProfiles();
  const { t } = useI18n();
  const router = useRouter();

  if (!activeProfile) return null;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: activeProfile.color }]}>
          <Text style={styles.avatarText}>{activeProfile.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={type.h2}>{activeProfile.name}</Text>
          {subtitle ? <Text style={[type.small, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/settings")}
        style={styles.switchBtn}
        accessibilityLabel={t("switchProfile")}
      >
        <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...type.h3,
    color: colors.white,
  },
  switchBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
});
