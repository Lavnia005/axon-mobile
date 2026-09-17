import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { groupService } from "@/services/groupService";
import { colors } from "@/theme";

const theme = colors.dark;

export default function EntrarGrupoScreen() {
  const { token } = useAuth();

  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleEntrar() {
    if (!token) {
      return;
    }

    const codigoFormatado = codigo.trim();

    if (!codigoFormatado) {
      setError("Informe o código do grupo.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await groupService.joinGroup(
        {
          code: codigoFormatado,
        },
        token,
      );

      router.replace("/(main)/tabs/grupos");
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);

      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "Este grupo possui senha."
      ) {
        setSenha("");
        setPasswordError("");
        setShowPasswordModal(true);
        return;
      }

      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Não foi possível entrar no grupo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEntrarComSenha() {
    if (!token) {
      return;
    }

    const codigoFormatado = codigo.trim();
    const senhaFormatada = senha.trim();

    if (!senhaFormatada) {
      setPasswordError("Informe a senha do grupo.");
      return;
    }

    try {
      setIsPasswordLoading(true);
      setPasswordError("");

      await groupService.joinGroup(
        {
          code: codigoFormatado,
          password: senhaFormatada,
        },
        token,
      );

      setShowPasswordModal(false);

      router.replace("/(main)/tabs/grupos");
    } catch (error) {
      console.error("Erro ao entrar no grupo com senha:", error);

      if (error instanceof ApiError) {
        setPasswordError(error.message);
      } else {
        setPasswordError(
          "Não foi possível entrar no grupo.",
        );
      }
    } finally {
      setIsPasswordLoading(false);
    }
  }

  function handleFecharModal() {
    if (isPasswordLoading) {
      return;
    }

    setShowPasswordModal(false);
    setSenha("");
    setPasswordError("");
    setShowPassword(false);
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(main)/tabs/grupos")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.textPrimary}
            />

            <Text style={styles.backButtonText}>
              Voltar
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="enter-outline"
                size={26}
                color={theme.secondary}
              />
            </View>

            <Text style={styles.title}>
              Entrar em grupo
            </Text>

            <Text style={styles.subtitle}>
              Digite o código compartilhado pelo grupo para participar.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Código do grupo
              </Text>

              <TextInput
                style={styles.codeInput}
                placeholder="Digite o código do grupo"
                placeholderTextColor={theme.textSecondary}
                value={codigo}
                onChangeText={setCodigo}
                autoCorrect={false}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleEntrar}
              />

              <Text style={styles.helpText}>
                Use o código enviado pelo administrador do grupo.
              </Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={theme.error}
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={theme.secondary}
                />
              </View>

              <Text style={styles.infoText}>
                Se o grupo for protegido, a senha será solicitada no próximo passo.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.joinButton,
                isLoading && styles.joinButtonDisabled,
              ]}
              onPress={handleEntrar}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.textPrimary}
                />
              ) : (
                <>
                  <Ionicons
                    name="enter-outline"
                    size={20}
                    color={theme.textPrimary}
                  />

                  <Text style={styles.joinButtonText}>
                    Entrar no grupo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={handleFecharModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={theme.secondary}
              />
            </View>

            <Text style={styles.modalTitle}>
              Grupo protegido
            </Text>

            <Text style={styles.modalDescription}>
              Este grupo exige uma senha para permitir a entrada.
            </Text>

            <Text style={styles.modalLabel}>
              Senha
            </Text>

            <View
              style={[
                styles.passwordContainer,
                passwordError
                  ? styles.passwordContainerError
                  : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite a senha"
                placeholderTextColor={theme.textSecondary}
                value={senha}
                onChangeText={(value) => {
                  setSenha(value);

                  if (passwordError) {
                    setPasswordError("");
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleEntrarComSenha}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword((previous) => !previous)
                }
                activeOpacity={0.7}
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
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <View style={styles.passwordErrorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.error}
                />

                <Text style={styles.passwordErrorText}>
                  {passwordError}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleFecharModal}
                activeOpacity={0.8}
                disabled={isPasswordLoading}
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isPasswordLoading &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleEntrarComSenha}
                activeOpacity={0.85}
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.textPrimary}
                  />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Entrar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 35,
  },

  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 22,
  },

  backButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },

  header: {
    marginBottom: 34,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.secondary}15`,
    borderWidth: 1,
    borderColor: `${theme.secondary}40`,
    marginBottom: 16,
  },

  title: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 7,
  },

  subtitle: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
  },

  form: {
    flex: 1,
    gap: 24,
  },

  inputGroup: {
    gap: 8,
  },

  label: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  codeInput: {
    minHeight: 56,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 15,
    paddingHorizontal: 16,
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  helpText: {
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 13,
    borderRadius: 13,
    backgroundColor: `${theme.error}10`,
    borderWidth: 1,
    borderColor: `${theme.error}35`,
  },

  errorText: {
    flex: 1,
    color: theme.error,
    fontSize: 13,
    lineHeight: 18,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 14,
    backgroundColor: `${theme.secondary}0D`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${theme.secondary}25`,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.secondary}12`,
  },

  infoText: {
    flex: 1,
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  joinButton: {
    minHeight: 56,
    marginTop: "auto",
    borderRadius: 16,
    backgroundColor: theme.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  joinButtonDisabled: {
    opacity: 0.65,
  },

  joinButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },

  modalCard: {
    width: "100%",
    backgroundColor: theme.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.border,
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.secondary}15`,
    borderWidth: 1,
    borderColor: `${theme.secondary}35`,
    marginBottom: 16,
  },

  modalTitle: {
    color: theme.textPrimary,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 6,
  },

  modalDescription: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 22,
  },

  modalLabel: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  passwordContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
  },

  passwordContainerError: {
    borderColor: theme.error,
  },

  passwordInput: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 15,
    color: theme.textPrimary,
    fontSize: 15,
  },

  eyeButton: {
    width: 50,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },

  passwordErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  passwordErrorText: {
    flex: 1,
    color: theme.error,
    fontSize: 12,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },

  cancelButtonText: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  confirmButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.primary,
  },

  confirmButtonDisabled: {
    opacity: 0.65,
  },

  confirmButtonText: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
});