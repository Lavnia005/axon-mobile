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

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function formatBirthDate(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 8);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    return `${numbers.slice(0, 2)}/${numbers.slice(
      2,
      4
    )}/${numbers.slice(4)}`;
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      7
    )}-${numbers.slice(7)}`;
  }

  function convertBirthDateToApi(value: string) {
    const [day, month, year] = value.split("/");

    return `${year}-${month}-${day}`;
  }

  async function handleRegister() {
    try {
      setErrorMessage("");

      if (
        !name.trim() ||
        !email.trim() ||
        !birthDate.trim() ||
        !phone.trim() ||
        !password ||
        !confirmPassword
      ) {
        setErrorMessage("Preencha todos os campos.");
        return;
      }

      const birthDatePattern =
        /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

      if (!birthDatePattern.test(birthDate)) {
        setErrorMessage(
          "Informe a data no formato DD/MM/AAAA."
        );
        return;
      }

      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      if (!passwordPattern.test(password)) {
        setErrorMessage(
          "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número."
        );
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }

      setIsSubmitting(true);

      await register({
        name: name.trim(),
        email: email.trim(),
        birthDate: convertBirthDateToApi(birthDate),
        phone: phone.trim(),
        password,
      });

      router.replace({
        pathname: "/(auth)",
        params: {
          registered: "true",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Não foi possível criar sua conta."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={[
        "#070B14",
        "#0A1020",
        "#0D1224",
        "#070B14",
      ]}
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
          keyboardVerticalOffset={
            Platform.OS === "ios" ? 12 : 0
          }
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.brand}>
                <Image
                  source={require(
                    "../../../assets/images/axon-logo.png"
                  )}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.brandName}>AXON</Text>

                <Text style={styles.subtitle}>
                  Comece sua evolução.
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.form}>
                  <AppInput
                    variant="dark"
                    label="Nome"
                    placeholder="Digite seu nome"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <AppInput
                    variant="dark"
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <AppInput
                    variant="dark"
                    label="Data de nascimento"
                    placeholder="DD/MM/AAAA"
                    value={birthDate}
                    onChangeText={(value) =>
                      setBirthDate(formatBirthDate(value))
                    }
                    keyboardType="numeric"
                    maxLength={10}
                  />

                  <AppInput
                    variant="dark"
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChangeText={(value) =>
                      setPhone(formatPhone(value))
                    }
                    keyboardType="phone-pad"
                    maxLength={15}
                  />

                  <AppInput
                    variant="dark"
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
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

                  <AppInput
                    variant="dark"
                    label="Confirmar senha"
                    placeholder="Digite sua senha novamente"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    rightElement={
                      <Pressable
                        onPress={() =>
                          setShowConfirmPassword(
                            (current) => !current
                          )
                        }
                        hitSlop={12}
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={20}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    }
                  />

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
                    onPress={handleRegister}
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
                      style={styles.registerButton}
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
                              styles.registerButtonText
                            }
                          >
                            Criar conta
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color="#FFFFFF"
                            style={styles.buttonArrow}
                          />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      router.replace("/(auth)")
                    }
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerText}>
                      Já tem uma conta?{" "}
                      <Text
                        style={
                          styles.footerHighlight
                        }
                      >
                        Entrar
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

    paddingTop: spacing.xxl,
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
    width: 64,
    height: 64,

    marginBottom: spacing.sm,
  },

  brandName: {
    color: theme.textPrimary,

    fontSize: 24,
    fontWeight: "500",

    letterSpacing: 6,

    marginLeft: 6,
  },

  subtitle: {
    color: theme.textSecondary,

    fontSize: 12,

    marginTop: spacing.sm,
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

  registerButton: {
    minHeight: 52,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 14,

    paddingHorizontal: spacing.lg,
  },

  registerButtonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "700",
  },

  buttonArrow: {
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