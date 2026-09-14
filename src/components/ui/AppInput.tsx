import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors, spacing, typography } from "@/theme";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  variant?: "light" | "dark";
  rightElement?: ReactNode;
};

export default function AppInput({
  label,
  error,
  variant = "light",
  rightElement,
  style,
  ...props
}: AppInputProps) {
  const theme = colors[variant];

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.textPrimary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : theme.border,
          },
        ]}
      >
        <TextInput
          {...props}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              color: theme.textPrimary,
            },
            style,
          ]}
        />

        {rightElement ? (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[
            styles.error,
            {
              color: theme.error,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
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
  },

  inputWrapper: {
    minHeight: 52,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius: 14,
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,

    ...typography.body,
  },

  rightElement: {
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  error: {
    ...typography.caption,
  },
});