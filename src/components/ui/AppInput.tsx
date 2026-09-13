import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export default function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        {...props}
        placeholderTextColor={colors.light.textSecondary}
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.xs,
  },

  label: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.light.textPrimary,
  },

  input: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,

    backgroundColor: colors.light.surface,
    color: colors.light.textPrimary,

    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,

    ...typography.body,
  },

  inputError: {
    borderColor: colors.light.error,
  },

  error: {
    ...typography.caption,
    color: colors.light.error,
  },
});