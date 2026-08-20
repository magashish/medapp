import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Chip } from "@/components/Chip";
import { useI18n } from "@/i18n/context";
import { useProfiles } from "@/state/ProfileContext";
import { createProfile } from "@/db/queries";
import type { Relation } from "@/db/types";
import { colors, spacing, type } from "@/theme";

const RELATIONS: Relation[] = ["self", "parent", "spouse", "child", "other"];
const PALETTE = ["#0F7A4F", "#E8722C", "#2563EB", "#7C3AED", "#DB2777", "#0891B2"];

export default function AddProfile() {
  const router = useRouter();
  const params = useLocalSearchParams<{ first?: string }>();
  const { t } = useI18n();
  const { profiles, refreshProfiles, setActiveProfileId } = useProfiles();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<Relation>(params.first ? "self" : "parent");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const color = PALETTE[profiles.length % PALETTE.length];
      const profile = await createProfile({ name: name.trim(), relation, color });
      await refreshProfiles();
      setActiveProfileId(profile.id);
      if (params.first) {
        router.replace("/(tabs)/today");
      } else {
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.formGroup}>
        <TextField
          label={t("name")}
          placeholder={t("namePlaceholder")}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <View>
          <Text style={[type.smallMedium, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            {t("relation")}
          </Text>
          <View style={styles.chipRow}>
            {RELATIONS.map((r) => (
              <Chip key={r} label={t(r)} selected={relation === r} onPress={() => setRelation(r)} />
            ))}
          </View>
        </View>
      </View>
      <Button
        label={t("save")}
        size="lg"
        fullWidth
        disabled={!name.trim()}
        loading={saving}
        onPress={handleSave}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    gap: spacing.xl,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
