import React, {
  useCallback,
  useState,
} from "react";

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

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { groupService } from "@/services/groupService";
import {
  Group,
  UpdateGroupData,
} from "@/types/group";
import { colors } from "@/theme";

const theme = colors.dark;

export default function EditarGrupoScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { token, user } = useAuth();

  const currentUserId = user?.id;

  const [group, setGroup] =
    useState<Group | null>(null);

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    maxMembers,
    setMaxMembers,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    removePassword,
    setRemovePassword,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  function getUserId(
    value:
      | Group["creator"]
      | Group["members"][number]["user"],
  ) {
    if (typeof value === "string") {
      return value;
    }

    return value._id;
  }

  const carregarGrupo = useCallback(
    async () => {
      if (!id || !token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const grupo =
          await groupService.getGroupById(
            id,
            token,
          );

        const currentMember =
          grupo.members.find(
            (member) =>
              getUserId(
                member.user,
              ) === currentUserId,
          );

        if (
          !currentMember ||
          currentMember.role !==
            "admin"
        ) {
          setError(
            "Apenas administradores podem editar este grupo.",
          );

          return;
        }

        setGroup(grupo);

        setName(grupo.name);

        setDescription(
          grupo.description ?? "",
        );

        setMaxMembers(
          String(
            grupo.maxMembers,
          ),
        );

        setPassword("");
        setRemovePassword(false);
      } catch (error) {
        if (
          error instanceof ApiError
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Não foi possível carregar o grupo.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      id,
      token,
      currentUserId,
    ],
  );

  useFocusEffect(
    useCallback(() => {
      void carregarGrupo();
    }, [carregarGrupo]),
  );

  function voltar() {
    if (!id) {
      router.replace(
        "/(main)/tabs/grupos",
      );

      return;
    }

    router.replace({
      pathname:
        "/(main)/grupos/[id]",
      params: {
        id,
      },
    });
  }

  function validarFormulario() {
    const formattedName =
      name.trim();

    if (!formattedName) {
      setFormError(
        "Informe o nome do grupo.",
      );

      return false;
    }

    const max =
      Number(maxMembers);

    if (
      !Number.isInteger(max)
    ) {
      setFormError(
        "A quantidade máxima deve ser um número inteiro.",
      );

      return false;
    }

    if (
      max < 2 ||
      max > 100
    ) {
      setFormError(
        "A quantidade máxima deve estar entre 2 e 100.",
      );

      return false;
    }

    if (
      group &&
      max <
        group.members.length
    ) {
      setFormError(
        `O grupo já possui ${group.members.length} participantes.`,
      );

      return false;
    }

    setFormError("");

    return true;
  }

  async function salvarAlteracoes() {
    if (
      !id ||
      !token ||
      !group
    ) {
      return;
    }

    if (
      !validarFormulario()
    ) {
      return;
    }

    const data: UpdateGroupData = {
      name: name.trim(),

      description:
        description.trim(),

      maxMembers:
        Number(maxMembers),
    };

    if (removePassword) {
      data.password = "";
    } else if (
      password.trim()
    ) {
      data.password =
        password.trim();
    }

    try {
      setIsSaving(true);
      setFormError("");

      await groupService.updateGroup(
        id,
        data,
        token,
      );

      router.replace({
        pathname:
          "/(main)/grupos/[id]",
        params: {
          id,
        },
      });
    } catch (error) {
      if (
        error instanceof ApiError
      ) {
        setFormError(
          error.message,
        );
      } else {
        setFormError(
          "Não foi possível salvar as alterações.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handlePasswordChange(
    value: string,
  ) {
    setPassword(value);

    if (value) {
      setRemovePassword(false);
    }
  }

  function toggleRemovePassword() {
    setRemovePassword(
      (current) => !current,
    );

    setPassword("");
    setShowPassword(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
        <View
          style={
            styles.feedbackContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text
            style={
              styles.feedbackText
            }
          >
            Carregando grupo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
        <View
          style={
            styles.feedbackContainer
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={theme.error}
          />

          <Text
            style={
              styles.errorTitle
            }
          >
            Não foi possível editar
            este grupo
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.backErrorButton
            }
            onPress={voltar}
          >
            <Text
              style={
                styles.backErrorText
              }
            >
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={voltar}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={
                theme.textPrimary
              }
            />

            <Text
              style={
                styles.backButtonText
              }
            >
              Grupo
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.header
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Editar grupo
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Atualize as informações
              e configurações do grupo.
            </Text>
          </View>

          <View
            style={
              styles.form
            }
          >
            <View>
              <Text
                style={
                  styles.label
                }
              >
                Nome do grupo
              </Text>

              <TextInput
                style={
                  styles.input
                }
                value={name}
                onChangeText={
                  setName
                }
                placeholder="Nome do grupo"
                placeholderTextColor={
                  theme.textSecondary
                }
                maxLength={60}
              />
            </View>

            <View>
              <Text
                style={
                  styles.label
                }
              >
                Descrição
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
                value={
                  description
                }
                onChangeText={
                  setDescription
                }
                placeholder="Sobre o que é este grupo?"
                placeholderTextColor={
                  theme.textSecondary
                }
                multiline
                textAlignVertical="top"
                maxLength={300}
              />

              <Text
                style={
                  styles.helperText
                }
              >
                Opcional
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.label
                }
              >
                Máximo de participantes
              </Text>

              <TextInput
                style={
                  styles.input
                }
                value={
                  maxMembers
                }
                onChangeText={(
                  value,
                ) =>
                  setMaxMembers(
                    value.replace(
                      /[^0-9]/g,
                      "",
                    ),
                  )
                }
                placeholder="10"
                placeholderTextColor={
                  theme.textSecondary
                }
                keyboardType="numeric"
                maxLength={3}
              />

              <Text
                style={
                  styles.helperText
                }
              >
                Atualmente há{" "}
                {group.members.length}{" "}
                participante
                {group.members
                  .length !== 1
                  ? "s"
                  : ""}{" "}
                no grupo.
              </Text>
            </View>

            <View
              style={
                styles.passwordSection
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Senha do grupo
              </Text>

              <View
                style={
                  styles.passwordContainer
                }
              >
                <TextInput
                  style={
                    styles.passwordInput
                  }
                  value={
                    password
                  }
                  onChangeText={
                    handlePasswordChange
                  }
                  placeholder={
                    removePassword
                      ? "Senha será removida"
                      : "Nova senha"
                  }
                  placeholderTextColor={
                    removePassword
                      ? theme.error
                      : theme.textSecondary
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  editable={
                    !removePassword
                  }
                />

                {!removePassword ? (
                  <TouchableOpacity
                    style={
                      styles.eyeButton
                    }
                    onPress={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color={
                        theme.textSecondary
                      }
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text
                style={
                  styles.helperText
                }
              >
                Deixe em branco para
                manter a senha atual.
              </Text>

              <TouchableOpacity
                style={[
                  styles.removePasswordRow,
                  removePassword &&
                    styles.removePasswordRowActive,
                ]}
                onPress={
                  toggleRemovePassword
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    removePassword &&
                      styles.checkboxActive,
                  ]}
                >
                  {removePassword ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFFFFF"
                    />
                  ) : null}
                </View>

                <View
                  style={
                    styles.removePasswordContent
                  }
                >
                  <Text
                    style={
                      styles.removePasswordTitle
                    }
                  >
                    Remover senha
                  </Text>

                  <Text
                    style={
                      styles.removePasswordSubtitle
                    }
                  >
                    Qualquer pessoa com
                    o código poderá
                    entrar.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {formError ? (
              <View
                style={
                  styles.errorBox
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={
                    theme.error
                  }
                />

                <Text
                  style={
                    styles.formErrorText
                  }
                >
                  {formError}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.saveButton,
                isSaving &&
                  styles.disabledButton,
              ]}
              onPress={
                salvarAlteracoes
              }
              disabled={
                isSaving
              }
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Salvar alterações
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

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background,
    },

    keyboardContainer: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 40,
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
      marginBottom: 25,
    },

    backButtonText: {
      color:
        theme.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },

    header: {
      marginBottom: 28,
    },

    title: {
      color:
        theme.textPrimary,
      fontSize: 30,
      fontWeight: "700",
    },

    subtitle: {
      color:
        theme.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6,
      maxWidth: 330,
    },

    form: {
      gap: 22,
    },

    label: {
      color:
        theme.textPrimary,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
    },

    input: {
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.border,
      backgroundColor:
        theme.surface,
      paddingHorizontal: 15,
      color:
        theme.textPrimary,
      fontSize: 14,
    },

    descriptionInput: {
      minHeight: 110,
      paddingTop: 14,
      paddingBottom: 14,
    },

    helperText: {
      color:
        theme.textSecondary,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 6,
    },

    passwordSection: {
      marginTop: 2,
    },

    passwordContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.border,
      backgroundColor:
        theme.surface,
    },

    passwordInput: {
      flex: 1,
      minHeight: 50,
      paddingHorizontal: 15,
      color:
        theme.textPrimary,
      fontSize: 14,
      outlineStyle: "none",
    } as any,

    eyeButton: {
      width: 48,
      minHeight: 50,
      alignItems: "center",
      justifyContent:
        "center",
    },

    removePasswordRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        theme.border,
      paddingHorizontal: 13,
      paddingVertical: 12,
      marginTop: 13,
    },

    removePasswordRowActive: {
      borderColor:
        `${theme.error}70`,
      backgroundColor:
        `${theme.error}08`,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1,
      borderColor:
        theme.border,
      alignItems: "center",
      justifyContent:
        "center",
    },

    checkboxActive: {
      backgroundColor:
        theme.error,
      borderColor:
        theme.error,
    },

    removePasswordContent: {
      flex: 1,
    },

    removePasswordTitle: {
      color:
        theme.textPrimary,
      fontSize: 12,
      fontWeight: "600",
    },

    removePasswordSubtitle: {
      color:
        theme.textSecondary,
      fontSize: 10,
      lineHeight: 14,
      marginTop: 2,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        `${theme.error}45`,
      backgroundColor:
        `${theme.error}08`,
      paddingHorizontal: 13,
      paddingVertical: 11,
    },

    formErrorText: {
      flex: 1,
      color:
        theme.error,
      fontSize: 11,
      lineHeight: 16,
    },

    saveButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      borderRadius: 14,
      backgroundColor:
        theme.primary,
      marginTop: 4,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.6,
    },

    feedbackContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    feedbackText: {
      color:
        theme.textSecondary,
      fontSize: 14,
      marginTop: 12,
    },

    errorTitle: {
      color:
        theme.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 14,
    },

    errorText: {
      color:
        theme.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 7,
      marginBottom: 20,
    },

    backErrorButton: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor:
        theme.primary,
    },

    backErrorText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
  });