import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";

const theme = colors.dark;

export default function EsqueceuSenhaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* VOLTAR */}

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() =>
            router.replace("/(auth)")
          }
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.textPrimary}
          />

          <Text style={styles.backText}>
            Voltar
          </Text>
        </TouchableOpacity>

        {/* CONTEÚDO PRINCIPAL */}

        <View style={styles.main}>
          <LinearGradient
            colors={[
              "rgba(82,114,242,0.18)",
              "rgba(139,108,255,0.18)",
            ]}
            style={styles.iconContainer}
          >
            <Ionicons
              name="key-outline"
              size={34}
              color={theme.secondary}
            />
          </LinearGradient>

          <Text style={styles.title}>
            Recuperação de senha
          </Text>

          <Text style={styles.subtitle}>
            Estamos preparando uma forma
            segura e simples de recuperar
            o acesso à sua conta.
          </Text>

          {/* STATUS */}

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons
                name="construct-outline"
                size={20}
                color={theme.primary}
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                Recurso em desenvolvimento
              </Text>

              <Text style={styles.statusText}>
                A recuperação de senha será
                disponibilizada em uma próxima
                versão do Axon.
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={theme.secondary}
            />

            <Text style={styles.infoText}>
              O fluxo será implementado com
              validação segura da identidade
              do usuário.
            </Text>
          </View>
        </View>

        {/* BOTÃO */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.replace("/(auth)")
          }
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={[
              "#3155D9",
              "#6150E8",
              "#7C4DFF",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Voltar para o login
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingVertical: 8,
  },

  backText: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40,
  },

  iconContainer: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(139,108,255,0.28)",

    marginBottom: 25,
  },

  title: {
    color: theme.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },

  subtitle: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
    maxWidth: 310,
  },

  statusCard: {
    width: "100%",
    flexDirection: "row",

    backgroundColor: theme.surface,

    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,

    padding: 16,
    marginTop: 32,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(82,114,242,0.12)",

    marginRight: 13,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  statusText: {
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    paddingHorizontal: 8,
    gap: 9,
  },

  infoText: {
    flex: 1,
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  buttonWrapper: {
    borderRadius: 14,
    overflow: "hidden",
  },

  button: {
    height: 54,
    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 9,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});