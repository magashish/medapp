import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Chip } from "@/components/Chip";
import { TimePickerField } from "@/components/TimePickerField";
import { useI18n } from "@/i18n/context";
import { useProfiles } from "@/state/ProfileContext";
import { addMedicineWithSchedules } from "@/lib/medicineActions";
import { colors, radius, spacing, type } from "@/theme";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function AddMedicine() {
  const router = useRouter();
  const { t } = useI18n();
  const { activeProfile } = useProfiles();

  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState("30");
  const [threshold, setThreshold] = useState("5");
  const [doseAmount, setDoseAmount] = useState("1");
  const [times, setTimes] = useState<string[]>(["09:00"]);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (dow: number) => {
    setSelectedDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow].sort()
    );
  };

  const addTime = () => setTimes((prev) => [...prev, "13:00"]);
  const updateTime = (index: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  const removeTime = (index: number) => setTimes((prev) => prev.filter((_, i) => i !== index));

  const canSave = name.trim().length > 0 && times.length > 0 && selectedDays.length > 0 && !!activeProfile;

  const handleSave = async () => {
    if (!activeProfile || !canSave) return;
    setSaving(true);
    try {
      await addMedicineWithSchedules({
        profileId: activeProfile.id,
        name: name.trim(),
        strength: strength.trim(),
        instructions: instructions.trim(),
        quantityRemaining: Number(quantity) || 0,
        refillThreshold: Number(threshold) || 0,
        doseAmount: Number(doseAmount) || 1,
        times,
        daysOfWeek: selectedDays.join(","),
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.iconWrap}>
        <Ionicons name="medical" size={32} color={colors.white} />
      </View>

      <TextField
        label={t("medicineName")}
        value={name}
        onChangeText={setName}
        placeholder={t("medicineNamePlaceholder")}
        autoFocus
      />
      <TextField label={t("strength")} value={strength} onChangeText={setStrength} placeholder="500mg" />
      <TextField
        label={t("instructions")}
        value={instructions}
        onChangeText={setInstructions}
        placeholder={t("instructionsPlaceholder")}
      />

      <View style={styles.numberRow}>
        <TextField
          label={t("quantityRemaining")}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          containerStyle={styles.numberInput}
        />
        <TextField
          label={t("doseAmount")}
          value={doseAmount}
          onChangeText={setDoseAmount}
          keyboardType="numeric"
          containerStyle={styles.numberInput}
        />
      </View>
      <TextField
        label={t("refillThreshold")}
        value={threshold}
        onChangeText={setThreshold}
        keyboardType="numeric"
      />

      <View>
        <Text style={[type.smallMedium, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          {t("reminderTimes")}
        </Text>
        <View style={styles.timesList}>
          {times.map((time, i) => (
            <TimePickerField
              key={i}
              value={time}
              onChange={(v) => updateTime(i, v)}
              onRemove={times.length > 1 ? () => removeTime(i) : undefined}
            />
          ))}
        </View>
        <Button label={t("addTime")} variant="secondary" icon="add" onPress={addTime} style={{ marginTop: spacing.sm }} />
      </View>

      <View>
        <Text style={[type.smallMedium, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          {t("repeatOn")}
        </Text>
        <View style={styles.chipRow}>
          {DAY_KEYS.map((key, dow) => (
            <Chip key={key} label={t(key)} selected={selectedDays.includes(dow)} onPress={() => toggleDay(dow)} />
          ))}
        </View>
      </View>

      <Button
        label={t("saveAndSchedule")}
        icon="checkmark"
        size="lg"
        fullWidth
        disabled={!canSave}
        loading={saving}
        onPress={handleSave}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  numberRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  numberInput: {
    flex: 1,
  },
  timesList: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
