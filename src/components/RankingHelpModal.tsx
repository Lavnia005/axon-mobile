import React from "react";

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme";

const theme = colors.dark;

const UI = {
  blue: "#6B8CFF",
  blueSoft: "#A9BAFF",

  purple: "#8B6CFF",
  purpleSoft: "#C2B5FF",

  cyan: "#62E5F4",

  surface: "#151E30",
  surfaceRaised: "#1A2438",

  textMuted: "#8993A8",
};

type RankingHelpModalProps = {
  visible: boolean;
  onClose: () => void;
};

const rules = [
  {
    icon: "camera-outline" as const,
    title: "Envio de evidência",
    text:
      "Ao enviar uma evidência válida, você recebe os pontos definidos naquele objetivo.",
  },
  {
    icon: "checkmark-circle-outline" as const,
    title: "Validar evidência",
    text:
      "Ao fazer uma validação inicial, você recebe +1 ponto.",
  },
  {
    icon: "alert-circle-outline" as const,
    title: "Contestar",
    text:
      "Ao contestar uma evidência, você também recebe +1 ponto enquanto a decisão vai para votação.",
  },
  {
    icon: "close-circle-outline" as const,
    title: "Contestação rejeitada",
    text:
      "Se a evidência continuar válida, o +1 recebido pelo contestante é removido.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Contestação aceita",
    text:
      "Se a evidência for invalidada, os pontos daquele objetivo são removidos do autor.",
  },
  {
    icon: "time-outline" as const,
    title: "Empate no ranking",
    text:
      "Se duas pessoas tiverem a mesma pontuação, fica à frente quem atingiu aquela pontuação primeiro.",
  },
];

export function RankingHelpModal({
  visible,
  onClose,
}: RankingHelpModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="help-circle-outline"
                size={21}
                color={UI.cyan}
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Como funciona a pontuação
              </Text>

              <Text style={styles.subtitle}>
                Entenda como suas ações afetam o ranking.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={20}
                color={theme.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.rulesContent}
          >
            {rules.map((rule, index) => (
              <View
                key={rule.title}
                style={[
                  styles.ruleRow,
                  index !== rules.length - 1 &&
                    styles.ruleRowBorder,
                ]}
              >
                <View
                  style={[
                    styles.ruleIcon,
                    index % 2 === 0
                      ? styles.ruleIconBlue
                      : styles.ruleIconPurple,
                  ]}
                >
                  <Ionicons
                    name={rule.icon}
                    size={18}
                    color={
                      index % 2 === 0
                        ? UI.blueSoft
                        : UI.purpleSoft
                    }
                  />
                </View>

                <View style={styles.ruleText}>
                  <Text style={styles.ruleTitle}>
                    {rule.title}
                  </Text>

                  <Text style={styles.ruleDescription}>
                    {rule.text}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.footerNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={UI.cyan}
              />

              <Text style={styles.footerNoteText}>
                Sua pontuação nunca fica abaixo de zero.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.confirmButton}
            onPress={onClose}
          >
            <Text style={styles.confirmButtonText}>
              Entendi
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 6, 12, 0.78)",
  },

  modalCard: {
    maxHeight: "82%",

    backgroundColor: "#101827",

    borderRadius: 24,

    borderWidth: 1,
    borderColor: "#2B3852",

    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 15,
  },

  headerIcon: {
    width: 42,
    height: 42,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(98,229,244,0.09)",

    borderWidth: 1,
    borderColor: "rgba(98,229,244,0.18)",

    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: theme.textPrimary,

    fontSize: 16,
    fontWeight: "800",
  },

  subtitle: {
    color: theme.textSecondary,

    fontSize: 11,
    lineHeight: 16,

    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: UI.surface,

    borderWidth: 1,
    borderColor: theme.border,

    marginLeft: 10,
  },

  divider: {
    height: 1,

    backgroundColor: "rgba(255,255,255,0.06)",

    marginHorizontal: 18,
  },

  rulesContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 8,
  },

  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",

    paddingVertical: 14,
  },

  ruleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.055)",
  },

  ruleIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,

    borderWidth: 1,
  },

  ruleIconBlue: {
    backgroundColor: "rgba(107,140,255,0.09)",
    borderColor: "rgba(107,140,255,0.16)",
  },

  ruleIconPurple: {
    backgroundColor: "rgba(139,108,255,0.09)",
    borderColor: "rgba(139,108,255,0.16)",
  },

  ruleText: {
    flex: 1,

    paddingTop: 1,
  },

  ruleTitle: {
    color: theme.textPrimary,

    fontSize: 13,
    fontWeight: "700",

    marginBottom: 4,
  },

  ruleDescription: {
    color: UI.textMuted,

    fontSize: 11,
    lineHeight: 16,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: UI.surfaceRaised,

    borderRadius: 13,

    paddingHorizontal: 12,
    paddingVertical: 10,

    marginTop: 5,
  },

  footerNoteText: {
    flex: 1,

    color: theme.textSecondary,

    fontSize: 10,
    lineHeight: 15,

    marginLeft: 8,
  },

  confirmButton: {
    height: 46,

    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 18,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.primary,
  },

  confirmButtonText: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "800",
  },
});