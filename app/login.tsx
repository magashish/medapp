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
import { colors, spacing, type } from "@/theme";

export default function Login() {
  const router = useRouter();
  const { t } = useI18n();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? t("invalidCredentials") : (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="medical" size={40} color={colors.primary} />
      </View>
      <View>
        <Text style={[type.h1, { textAlign: "center" }]}>{t("appName")}</Text>
        <Text style={[type.body, { color: colors.textMuted, textAlign: "center", marginTop: spacing.xs }]}>
          {t("tagline")}
        </Text>
      </View>

      <View style={styles.form}>
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
          autoComplete="password"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={t("signIn")}
          size="lg"
          fullWidth
          loading={loading}
          disabled={!email.trim() || !password}
          onPress={handleSubmit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[type.body, { color: colors.textMuted }]}>{t("noAccountYet")}</Text>
        <Link href="/register" replace>
          <Text style={[type.bodyMedium, { color: colors.primary }]}>{t("createAccount")}</Text>
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
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
