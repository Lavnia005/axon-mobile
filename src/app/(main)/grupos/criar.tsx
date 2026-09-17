import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

export default function CriarGrupoScreen() {
  const { token } = useAuth();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [senha, setSenha] = useState("");
  const [qtdMaxima, setQtdMaxima] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCriar() {
    if (!token) {
      return;
    }

    const nomeFormatado = nome.trim();
    const descricaoFormatada = descricao.trim();
    const senhaFormatada = senha.trim();

    if (!nomeFormatado) {
      setError("Informe o nome do grupo.");
      return;
    }

    let maxMembers: number | undefined;

    if (qtdMaxima.trim()) {
      maxMembers = Number(qtdMaxima);

      if (
        Number.isNaN(maxMembers) ||
        !Number.isInteger(maxMembers) ||
        maxMembers < 2 ||
        maxMembers > 100
      ) {
        setError(
          "A quantidade máxima deve ser um número inteiro entre 2 e 100.",
        );
        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");

      await groupService.createGroup(
        {
          name: nomeFormatado,
          ...(descricaoFormatada && {
            description: descricaoFormatada,
          }),
          ...(senhaFormatada && {
            password: senhaFormatada,
          }),
          ...(maxMembers !== undefined && {
            maxMembers,
          }),
        },
        token,
      );

      router.replace("/(main)/tabs/grupos");
    } catch (error) {
      console.error("Erro ao criar grupo:", error);

      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Não foi possível criar o grupo.");
      }
    } finally {
      setIsLoading(false);
    }
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
                name="people-outline"
                size={26}
                color={theme.secondary}
              />
            </View>

            <Text style={styles.title}>
              Criar grupo
            </Text>

            <Text style={styles.subtitle}>
              Crie um espaço para evoluir e cumprir objetivos em conjunto.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nome do grupo
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Ex: Grupo de estudos"
                placeholderTextColor={theme.textSecondary}
                value={nome}
                onChangeText={setNome}
                maxLength={60}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Descrição
                </Text>

                <Text style={styles.optionalText}>
                  Opcional
                </Text>
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
                placeholder="Qual é o objetivo deste grupo?"
                placeholderTextColor={theme.textSecondary}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Senha
                </Text>

                <Text style={styles.optionalText}>
                  Opcional
                </Text>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Proteja a entrada do grupo"
                  placeholderTextColor={theme.textSecondary}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword((previous) => !previous)
                  }
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

              <Text style={styles.helpText}>
                Se deixar vazio, qualquer pessoa com o código poderá entrar.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Limite de membros
                </Text>

                <Text style={styles.optionalText}>
                  Opcional
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Padrão: 10"
                placeholderTextColor={theme.textSecondary}
                value={qtdMaxima}
                onChangeText={(value) =>
                  setQtdMaxima(value.replace(/\D/g, ""))
                }
                keyboardType="numeric"
                maxLength={3}
              />

              <Text style={styles.helpText}>
                Entre 2 e 100 participantes.
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
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.secondary}
              />

              <Text style={styles.infoText}>
                O código para convidar outras pessoas será criado
                automaticamente.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                isLoading && styles.createButtonDisabled,
              ]}
              onPress={handleCriar}
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
                    name="add"
                    size={20}
                    color={theme.textPrimary}
                  />

                  <Text style={styles.createButtonText}>
                    Criar grupo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 30,
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
    maxWidth: 330,
  },

  form: {
    gap: 22,
  },

  inputGroup: {
    gap: 8,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  optionalText: {
    color: theme.textSecondary,
    fontSize: 12,
  },

  input: {
    minHeight: 54,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 15,
    paddingHorizontal: 16,
    color: theme.textPrimary,
    fontSize: 15,
  },

  descriptionInput: {
    minHeight: 105,
    paddingTop: 15,
    paddingBottom: 15,
  },

  passwordContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 15,
  },

  passwordInput: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 16,
    color: theme.textPrimary,
    fontSize: 15,
  },

  eyeButton: {
    minWidth: 48,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: `${theme.secondary}0D`,
    borderWidth: 1,
    borderColor: `${theme.secondary}25`,
  },

  infoText: {
    flex: 1,
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  createButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: theme.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },

  createButtonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});