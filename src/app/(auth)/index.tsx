import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import AppInput from "@/components/ui/AppInput";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing } from "@/theme";

const theme = colors.dark;

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    try {
      setErrorMessage("");

      if (!email.trim() || !password.trim()) {
        setErrorMessage("Preencha o e-mail e a senha.");
        return;
      }

      setIsSubmitting(true);

      await login({
        email: email.trim(),
        password,
      });

      router.replace("/(main)/tabs/home");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Não foi possível realizar o login.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={["#070B14", "#0A1020", "#0D1224", "#070B14"]}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : Platform.OS === "android"
                ? "height"
                : undefined
          }
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.content}>
              <View style={styles.brand}>
                <Image
                  source={require("../../../assets/images/axon-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.brandName}>AXON</Text>

                <View style={styles.brandConcept}>
                  <Text style={styles.conceptText}>FOCO</Text>

                  <View
                    style={[
                      styles.conceptDot,
                      styles.blueDot,
                    ]}
                  />

                  <Text style={styles.conceptText}>
                    DISCIPLINA
                  </Text>

                  <View
                    style={[
                      styles.conceptDot,
                      styles.purpleDot,
                    ]}
                  />

                  <Text style={styles.conceptText}>
                    EVOLUÇÃO
                  </Text>
                </View>

                <Text style={styles.subtitle}>
                  Transforme metas em constância.
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.form}>
                  <AppInput
                    variant="dark"
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <AppInput
                    variant="dark"
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    rightElement={
                      <Pressable
                        onPress={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        hitSlop={12}
                      >
                        <Ionicons
                          name={
                            showPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={20}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    }
                  />

                  <Pressable
                    onPress={() =>
                      router.push(
                        "/(auth)/esqueceu_senha"
                      )
                    }
                    style={styles.forgotPassword}
                  >
                    <Text
                      style={styles.forgotPasswordText}
                    >
                      Esqueceu a senha?
                    </Text>
                  </Pressable>

                  {errorMessage ? (
                    <View style={styles.errorBox}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={theme.error}
                      />

                      <Text style={styles.errorText}>
                        {errorMessage}
                      </Text>
                    </View>
                  ) : null}

                  <Pressable
                    onPress={handleLogin}
                    disabled={isSubmitting}
                    style={({ pressed }) => [
                      styles.buttonContainer,

                      pressed &&
                        !isSubmitting &&
                        styles.buttonPressed,

                      isSubmitting &&
                        styles.buttonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "#2E5BFF",
                        "#4C63F0",
                        "#8B5CFF",
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.loginButton}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator
                          color="#FFFFFF"
                          size="small"
                        />
                      ) : (
                        <>
                          <Text
                            style={
                              styles.loginButtonText
                            }
                          >
                            Entrar
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color="#FFFFFF"
                            style={styles.loginArrow}
                          />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      router.push("/(auth)/cadastro")
                    }
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerText}>
                      Não tem uma conta?{" "}
                      <Text
                        style={
                          styles.footerHighlight
                        }
                      >
                        Cadastre-se
                      </Text>
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",

    paddingTop: spacing.xl,
    paddingBottom: 100,
  },

  content: {
    width: "100%",
    maxWidth: 400,

    alignSelf: "center",

    paddingHorizontal: spacing.xl,
  },

  brand: {
    alignItems: "center",

    marginBottom: spacing.xl,
  },

  logo: {
    width: 74,
    height: 74,

    marginBottom: spacing.sm,
  },

  brandName: {
    color: theme.textPrimary,

    fontSize: 25,
    fontWeight: "500",

    letterSpacing: 6,

    marginLeft: 6,
  },

  brandConcept: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    marginTop: spacing.xs,
  },

  conceptText: {
    color: "rgba(244, 246, 250, 0.42)",

    fontSize: 7,
    fontWeight: "500",

    letterSpacing: 1.2,
  },

  conceptDot: {
    width: 4,
    height: 4,

    borderRadius: 2,
  },

  blueDot: {
    backgroundColor: theme.primary,
  },

  purpleDot: {
    backgroundColor: theme.secondary,
  },

  subtitle: {
    color: theme.textSecondary,

    fontSize: 12,

    textAlign: "center",

    marginTop: spacing.md,
  },

  formCard: {
    width: "100%",

    backgroundColor:
      "rgba(18, 24, 41, 0.84)",

    borderRadius: 20,

    padding: spacing.lg,

    borderWidth: 1,
    borderColor:
      "rgba(255, 255, 255, 0.07)",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.22,
    shadowRadius: 18,

    elevation: 8,
  },

  form: {
    width: "100%",

    gap: spacing.md,
  },

  forgotPassword: {
    alignSelf: "flex-end",

    marginTop: -spacing.xs,
  },

  forgotPasswordText: {
    color: theme.primary,

    fontSize: 12,
    fontWeight: "600",
  },

  errorBox: {
    flexDirection: "row",

    alignItems: "center",

    gap: spacing.sm,

    backgroundColor:
      "rgba(239, 68, 68, 0.08)",

    borderWidth: 1,
    borderColor:
      "rgba(239, 68, 68, 0.15)",

    borderRadius: 10,

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  errorText: {
    flex: 1,

    color: theme.error,

    fontSize: 12,
  },

  buttonContainer: {
    width: "100%",

    borderRadius: 14,

    overflow: "hidden",

    marginTop: spacing.xs,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loginButton: {
    minHeight: 52,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 14,

    paddingHorizontal: spacing.lg,
  },

  loginButtonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "700",
  },

  loginArrow: {
    position: "absolute",

    right: spacing.lg,
  },

  footerLink: {
    alignItems: "center",

    marginTop: spacing.md,

    paddingVertical: spacing.xs,
  },

  footerText: {
    color: theme.textSecondary,

    fontSize: 12,
  },

  footerHighlight: {
    color: theme.primary,

    fontWeight: "700",
  },
});