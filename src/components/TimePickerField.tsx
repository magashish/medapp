import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, type } from "@/theme";
import { formatTime } from "@/lib/date";

let RNDateTimePicker: typeof import("@react-native-community/datetimepicker").default | null = null;
if (Platform.OS !== "web") {
  RNDateTimePicker = require("@react-native-community/datetimepicker").default;
}

function timeStringToDate(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function TimePickerField({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (time: string) => void;
  onRemove?: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === "web") {
    return (
      <View style={styles.row}>
        <View style={styles.webWrap}>
          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="HH:MM"
            style={styles.webInput}
          />
        </View>
        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable style={styles.field} onPress={() => setShowPicker(true)}>
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <Text style={[type.bodyMedium, { color: colors.text }]}>{formatTime(value)}</Text>
      </Pressable>
      {onRemove ? (
        <Pressable onPress={onRemove} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      ) : null}
      {showPicker && RNDateTimePicker ? (
        <RNDateTimePicker
          value={timeStringToDate(value)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowPicker(Platform.OS === "ios");
            if (event.type === "dismissed") {
              setShowPicker(false);
              return;
            }
            if (date) onChange(dateToTimeString(date));
            if (Platform.OS === "android") setShowPicker(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.white,
  },
  webWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.white,
  },
  webInput: {
    ...type.body,
    flex: 1,
    outlineStyle: "none" as never,
  },
  removeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },
});
