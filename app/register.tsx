import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/state/AuthContext";
import { ApiError } from "@/api/client";
import { colors, radius, spacing, type } from "@/theme";

export default function Register() {
  const router = useRouter();
  const { t } = useI18n();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace("/");
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        setError(Object.values(e.errors).flat()[0]);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="medical" size={40} color={colors.white} />
      </View>
      <Text style={[type.h1, { textAlign: "center" }]}>{t("appName")}</Text>

      <View style={styles.form}>
        <TextField label={t("name")} value={name} onChangeText={setName} autoComplete="name" />
        <TextField
          label={t("email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          label={t("password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
          hint="6+ characters"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={t("createAccount")}
          size="lg"
          fullWidth
          loading={loading}
          disabled={!name.trim() || !email.trim() || password.length < 6}
          onPress={handleSubmit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[type.body, { color: colors.textMuted }]}>{t("haveAccountAlready")}</Text>
        <Link href="/login" replace>
          <Text style={[type.bodyMedium, { color: colors.primary }]}>{t("signIn")}</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  iconWrap: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    ...type.small,
    color: colors.danger,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
});
