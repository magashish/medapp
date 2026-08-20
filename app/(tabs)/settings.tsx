import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Badge } from "@/components/Badge";
import { useI18n } from "@/i18n/context";
import { useProfiles } from "@/state/ProfileContext";
import { useAuth } from "@/state/AuthContext";
import { ensureNotificationSetup } from "@/lib/notifications";
import { inviteCaregiver, listMembers, type FamilyMemberUser } from "@/db/queries";
import { ApiError } from "@/api/client";
import { colors, radius, spacing, type } from "@/theme";

export default function Settings() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const { profiles, activeProfile, setActiveProfileId } = useProfiles();
  const { user, logout } = useAuth();

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

      {activeProfile ? <CaregiverAccessCard profileId={activeProfile.id} profileName={activeProfile.name} /> : null}

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

      <Card>
        <Text style={[type.bodyMedium, { marginBottom: spacing.xs }]}>{user?.name}</Text>
        <Text style={[type.small, { color: colors.textMuted, marginBottom: spacing.md }]}>{user?.email}</Text>
        <Button
          label={t("logout")}
          variant="secondary"
          icon="log-out-outline"
          onPress={() =>
            Alert.alert(t("logout"), undefined, [
              { text: t("cancel"), style: "cancel" },
              { text: t("logout"), style: "destructive", onPress: () => logout() },
            ])
          }
        />
      </Card>
    </Screen>
  );
}

function CaregiverAccessCard({ profileId, profileName }: { profileId: number; profileName: string }) {
  const { t } = useI18n();
  const [members, setMembers] = useState<FamilyMemberUser[]>([]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMembers(await listMembers(profileId));
    } catch {
      // Non-owners may not have access to full member details; ignore.
    }
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setFeedback(null);
    try {
      const result = await inviteCaregiver(profileId, email.trim());
      setFeedback(result.status === "linked" ? t("caregiverLinked") : t("caregiverInvitePending"));
      setEmail("");
      load();
    } catch (e) {
      setFeedback(e instanceof ApiError ? e.message : t("caregiverInvitePending"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Text style={[type.smallMedium, { color: colors.textMuted, marginBottom: spacing.md }]}>
        {t("familyAccess")} · {profileName}
      </Text>

      {members.map((m) => (
        <View key={m.id} style={styles.memberRow}>
          <Text style={[type.body, { flex: 1 }]}>{m.name}</Text>
          <Badge label={m.role === "owner" ? t("owner") : t("caregiverRole")} tone={m.role === "owner" ? "primary" : "muted"} />
        </View>
      ))}

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <TextField
          label={t("inviteCaregiver")}
          placeholder={t("inviteEmailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {feedback ? <Text style={[type.small, { color: colors.textMuted }]}>{feedback}</Text> : null}
        <Button label={t("sendInvite")} variant="secondary" loading={sending} disabled={!email.trim()} onPress={handleInvite} />
      </View>
    </Card>
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
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});
