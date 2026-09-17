import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
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
  GroupMember,
  GroupRole,
} from "@/types/group";
import { colors } from "@/theme";

const theme = colors.dark;

export default function MembrosGrupoScreen() {
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

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    selectedMember,
    setSelectedMember,
  ] = useState<GroupMember | null>(
    null,
  );

  const [
    showMemberMenu,
    setShowMemberMenu,
  ] = useState(false);

  const [
    showRemoveConfirm,
    setShowRemoveConfirm,
  ] = useState(false);

  const [
    isUpdatingMember,
    setIsUpdatingMember,
  ] = useState(false);

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

        setGroup(grupo);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Não foi possível carregar os membros.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [id, token],
  );

  useFocusEffect(
    useCallback(() => {
      carregarGrupo();
    }, [carregarGrupo]),
  );

  function getUserId(
    value:
      | GroupMember["user"]
      | Group["creator"],
  ) {
    if (typeof value === "string") {
      return value;
    }

    return value._id;
  }

  function getUserName(
    member: GroupMember,
  ) {
    if (
      typeof member.user === "string"
    ) {
      return "Membro";
    }

    return member.user.name;
  }

  function getInitials(
    name: string,
  ) {
    const names = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (names.length === 0) {
      return "?";
    }

    if (names.length === 1) {
      return names[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      names[0].charAt(0) +
      names[
        names.length - 1
      ].charAt(0)
    ).toUpperCase();
  }

  function getCurrentUserRole():
    | GroupRole
    | null {
    if (
      !group ||
      !currentUserId
    ) {
      return null;
    }

    const member =
      group.members.find(
        (member) =>
          getUserId(
            member.user,
          ) === currentUserId,
      );

    return member?.role ?? null;
  }

  function getMemberDescription(
    member: GroupMember,
  ) {
    if (!group) {
      return "";
    }

    const memberId =
      getUserId(member.user);

    const creatorId =
      getUserId(group.creator);

    if (memberId === creatorId) {
      return "Criador • Administrador";
    }

    if (
      member.role === "admin"
    ) {
      return "Administrador";
    }

    return "Membro";
  }

  function voltarParaGrupo() {
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

  function abrirOpcoesMembro(
    member: GroupMember,
  ) {
    if (!isAdmin) {
      return;
    }

    const memberId =
      getUserId(member.user);

    if (
      memberId === currentUserId
    ) {
      return;
    }

    setSelectedMember(member);
    setShowMemberMenu(true);
  }

  function fecharMenu() {
    if (isUpdatingMember) {
      return;
    }

    setShowMemberMenu(false);
    setSelectedMember(null);
  }

  async function alterarCargo() {
    if (
      !selectedMember ||
      !id ||
      !token
    ) {
      return;
    }

    const memberId =
      getUserId(
        selectedMember.user,
      );

    const newRole: GroupRole =
      selectedMember.role ===
      "admin"
        ? "member"
        : "admin";

    try {
      setIsUpdatingMember(true);

      await groupService.updateMemberRole(
        id,
        memberId,
        newRole,
        token,
      );

      setShowMemberMenu(false);
      setSelectedMember(null);

      await carregarGrupo();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível alterar o cargo.";

      Alert.alert(
        "Erro",
        message,
      );
    } finally {
      setIsUpdatingMember(false);
    }
  }

  function confirmarRemocao() {
    if (!selectedMember) {
      return;
    }

    setShowMemberMenu(false);
    setShowRemoveConfirm(true);
  }

  function cancelarRemocao() {
    if (isUpdatingMember) {
      return;
    }

    setShowRemoveConfirm(false);
    setSelectedMember(null);
  }

  async function removerMembro(
    member: GroupMember,
  ) {
    if (!id || !token) {
      return;
    }

    const memberId =
      getUserId(member.user);

    try {
      setIsUpdatingMember(true);

      await groupService.removeMember(
        id,
        memberId,
        token,
      );

      setShowRemoveConfirm(false);
      setShowMemberMenu(false);
      setSelectedMember(null);

      await carregarGrupo();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover o membro.";

      console.error(
        "Erro ao remover membro:",
        error,
      );

      Alert.alert(
        "Erro",
        message,
      );
    } finally {
      setIsUpdatingMember(false);
    }
  }

  const currentUserRole =
    getCurrentUserRole();

  const isAdmin =
    currentUserRole === "admin";

  const creatorId = group
    ? getUserId(group.creator)
    : null;

  const selectedMemberId =
    selectedMember
      ? getUserId(
          selectedMember.user,
        )
      : null;

  const selectedMemberIsCreator =
    !!selectedMemberId &&
    selectedMemberId ===
      creatorId;

  const selectedMemberIsSelf =
    !!selectedMemberId &&
    selectedMemberId ===
      currentUserId;

  const canChangeRole =
  isAdmin &&
  !!selectedMember &&
  !selectedMemberIsSelf &&
  !selectedMemberIsCreator;

  const canRemoveMember =
    isAdmin &&
    !!selectedMember &&
    !selectedMemberIsSelf &&
    !selectedMemberIsCreator;

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
            Carregando membros...
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
          <View
            style={
              styles.errorIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={theme.error}
            />
          </View>

          <Text
            style={
              styles.errorTitle
            }
          >
            Não foi possível carregar
            os membros
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            {error ||
              "Não foi possível encontrar este grupo."}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={carregarGrupo}
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.backLink
            }
            onPress={
              voltarParaGrupo
            }
          >
            <Text
              style={
                styles.backLinkText
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
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <View
          style={styles.topBar}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={
              voltarParaGrupo
            }
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
        </View>

        <View
          style={styles.header}
        >
          <Text
            style={styles.title}
          >
            Membros
          </Text>

          <Text
            style={styles.subtitle}
          >
            {group.name}
          </Text>

          <View
            style={
              styles.counterRow
            }
          >
            <Ionicons
              name="people-outline"
              size={15}
              color={
                theme.secondary
              }
            />

            <Text
              style={
                styles.counterText
              }
            >
              {group.members.length} de{" "}
              {group.maxMembers}{" "}
              participantes
            </Text>
          </View>
        </View>

        <View
          style={
            styles.memberList
          }
        >
          {group.members.map(
            (
              member,
              index,
            ) => {
              const memberId =
                getUserId(
                  member.user,
                );

              const name =
                getUserName(
                  member,
                );

              const profileImage =
                typeof member.user ===
                "string"
                  ? undefined
                  : member.user
                      .profileImage
                      ?.url;

              const isCurrentUser =
                memberId ===
                currentUserId;

              const isCreator =
                memberId === creatorId;

                const canOpen =
                isAdmin &&
                !isCurrentUser &&
                !isCreator;

              return (
                <TouchableOpacity
                  key={memberId}
                  style={[
                    styles.memberRow,
                    index !==
                      group.members
                        .length -
                        1 &&
                      styles.memberBorder,
                  ]}
                  activeOpacity={
                    canOpen
                      ? 0.7
                      : 1
                  }
                  onPress={() => {
                    if (
                      canOpen
                    ) {
                      abrirOpcoesMembro(
                        member,
                      );
                    }
                  }}
                >
                  <View
                    style={
                      styles.memberLeft
                    }
                  >
                    <View
                      style={
                        styles.avatar
                      }
                    >
                      {profileImage ? (
                        <Image
                          source={{
                            uri: profileImage,
                          }}
                          style={
                            styles.avatarImage
                          }
                        />
                      ) : (
                        <Text
                          style={
                            styles.avatarText
                          }
                        >
                          {getInitials(
                            name,
                          )}
                        </Text>
                      )}
                    </View>

                    <View
                      style={
                        styles.memberInfo
                      }
                    >
                      <View
                        style={
                          styles.nameRow
                        }
                      >
                        <Text
                          style={
                            styles.memberName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {name}
                        </Text>

                        {isCurrentUser ? (
                          <View
                            style={
                              styles.youBadge
                            }
                          >
                            <Text
                              style={
                                styles.youLabel
                              }
                            >
                              você
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text
                        style={
                          styles.memberRole
                        }
                      >
                        {getMemberDescription(
                          member,
                        )}
                      </Text>
                    </View>
                  </View>

                  {canOpen ? (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        theme.textSecondary
                      }
                    />
                  ) : null}
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {isAdmin ? (
          <Text
            style={
              styles.adminHint
            }
          >
            Como administrador, você
            pode tocar em outros
            membros para gerenciar
            suas permissões.
          </Text>
        ) : (
          <Text
            style={
              styles.adminHint
            }
          >
            Todos os membros do grupo
            podem visualizar esta
            lista.
          </Text>
        )}
      </ScrollView>

      {/* MODAL DE OPÇÕES DO MEMBRO */}

      <Modal
        visible={showMemberMenu}
        transparent
        animationType="fade"
        onRequestClose={
          fecharMenu
        }
      >
        <TouchableOpacity
          style={
            styles.modalOverlay
          }
          activeOpacity={1}
          onPress={fecharMenu}
        >
          <TouchableOpacity
            style={
              styles.actionSheet
            }
            activeOpacity={1}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            {selectedMember ? (
              <>
                <Text
                  style={
                    styles.sheetTitle
                  }
                >
                  {getUserName(
                    selectedMember,
                  )}
                </Text>

                <Text
                  style={
                    styles.sheetSubtitle
                  }
                >
                  {getMemberDescription(
                    selectedMember,
                  )}
                </Text>

                {canChangeRole ? (
                  <TouchableOpacity
                    style={
                      styles.actionRow
                    }
                    onPress={
                      alterarCargo
                    }
                    disabled={
                      isUpdatingMember
                    }
                  >
                    <View
                      style={
                        styles.actionIcon
                      }
                    >
                      <Ionicons
                        name={
                          selectedMember.role ===
                          "admin"
                            ? "person-outline"
                            : "shield-checkmark-outline"
                        }
                        size={21}
                        color={
                          theme.textPrimary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.actionContent
                      }
                    >
                      <Text
                        style={
                          styles.actionText
                        }
                      >
                        {selectedMember.role ===
                        "admin"
                          ? "Tornar membro"
                          : "Tornar administrador"}
                      </Text>

                      <Text
                        style={
                          styles.actionSubtitle
                        }
                      >
                        {selectedMember.role ===
                        "admin"
                          ? "Remover permissões administrativas"
                          : "Conceder permissões administrativas"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {canRemoveMember ? (
                  <TouchableOpacity
                    style={
                      styles.actionRow
                    }
                    onPress={
                      confirmarRemocao
                    }
                    disabled={
                      isUpdatingMember
                    }
                  >
                    <View
                      style={[
                        styles.actionIcon,
                        styles.dangerIcon,
                      ]}
                    >
                      <Ionicons
                        name="person-remove-outline"
                        size={21}
                        color={
                          theme.error
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.actionContent
                      }
                    >
                      <Text
                        style={
                          styles.dangerText
                        }
                      >
                        Remover do grupo
                      </Text>

                      <Text
                        style={
                          styles.actionSubtitle
                        }
                      >
                        Retirar este membro
                        do grupo
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {isUpdatingMember ? (
                  <ActivityIndicator
                    style={
                      styles.actionLoading
                    }
                    color={
                      theme.primary
                    }
                  />
                ) : null}
              </>
            ) : null}

            <TouchableOpacity
              style={
                styles.cancelButton
              }
              onPress={fecharMenu}
              disabled={
                isUpdatingMember
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO DA REMOÇÃO */}

      <Modal
        visible={
          showRemoveConfirm
        }
        transparent
        animationType="fade"
        onRequestClose={
          cancelarRemocao
        }
      >
        <View
          style={
            styles.confirmOverlay
          }
        >
          <View
            style={
              styles.confirmCard
            }
          >
            <View
              style={
                styles.confirmIcon
              }
            >
              <Ionicons
                name="person-remove-outline"
                size={26}
                color={theme.error}
              />
            </View>

            <Text
              style={
                styles.confirmTitle
              }
            >
              Remover membro?
            </Text>

            <Text
              style={
                styles.confirmMessage
              }
            >
              {selectedMember
                ? `Deseja remover ${getUserName(
                    selectedMember,
                  )} deste grupo?`
                : ""}
            </Text>

            <Text
              style={
                styles.confirmWarning
              }
            >
              O membro perderá o
              acesso ao grupo e às
              atividades relacionadas
              a ele.
            </Text>

            <View
              style={
                styles.confirmActions
              }
            >
              <TouchableOpacity
                style={
                  styles.confirmCancelButton
                }
                onPress={
                  cancelarRemocao
                }
                disabled={
                  isUpdatingMember
                }
                activeOpacity={0.75}
              >
                <Text
                  style={
                    styles.confirmCancelText
                  }
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  isUpdatingMember &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  if (
                    selectedMember
                  ) {
                    void removerMembro(
                      selectedMember,
                    );
                  }
                }}
                disabled={
                  isUpdatingMember
                }
                activeOpacity={0.75}
              >
                {isUpdatingMember ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.confirmDeleteText
                      }
                    >
                      Remover
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

    content: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 40,
    },

    topBar: {
      marginBottom: 25,
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      alignSelf: "flex-start",
    },

    backButtonText: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },

    header: {
      marginBottom: 24,
    },

    title: {
      color: theme.textPrimary,
      fontSize: 30,
      fontWeight: "700",
    },

    subtitle: {
      color:
        theme.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },

    counterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 14,
    },

    counterText: {
      color:
        theme.textSecondary,
      fontSize: 12,
    },

    memberList: {
      backgroundColor:
        theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        theme.border,
      overflow: "hidden",
    },

    memberRow: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    memberBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border,
    },

    memberLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    avatar: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        `${theme.secondary}14`,
      borderWidth: 1,
      borderColor:
        `${theme.secondary}35`,
      overflow: "hidden",
    },

    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 14,
    },

    avatarText: {
      color: theme.secondary,
      fontSize: 14,
      fontWeight: "700",
    },

    memberInfo: {
      flex: 1,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    memberName: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: "600",
      maxWidth: "80%",
    },

    youBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor:
        `${theme.primary}14`,
    },

    youLabel: {
      color: theme.primary,
      fontSize: 9,
      fontWeight: "700",
    },

    memberRole: {
      color:
        theme.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },

    adminHint: {
      color:
        theme.textSecondary,
      fontSize: 11,
      lineHeight: 17,
      textAlign: "center",
      marginTop: 18,
      paddingHorizontal: 25,
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

    errorIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        `${theme.error}10`,
    },

    errorTitle: {
      color: theme.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 14,
      textAlign: "center",
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

    retryButton: {
      backgroundColor:
        theme.primary,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 12,
    },

    retryButtonText: {
      color:
        theme.textPrimary,
      fontWeight: "600",
    },

    backLink: {
      marginTop: 17,
    },

    backLinkText: {
      color: theme.secondary,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        "flex-end",
      backgroundColor:
        "rgba(0, 0, 0, 0.65)",
    },

    actionSheet: {
      backgroundColor:
        theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor:
        theme.border,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
    },

    sheetHandle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        theme.border,
      alignSelf: "center",
      marginBottom: 18,
    },

    sheetTitle: {
      color:
        theme.textPrimary,
      fontSize: 19,
      fontWeight: "700",
    },

    sheetSubtitle: {
      color:
        theme.textSecondary,
      fontSize: 12,
      marginTop: 4,
      marginBottom: 12,
    },

    actionRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.border,
    },

    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        theme.background,
    },

    dangerIcon: {
      backgroundColor:
        `${theme.error}10`,
    },

    actionContent: {
      flex: 1,
    },

    actionText: {
      color:
        theme.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },

    actionSubtitle: {
      color:
        theme.textSecondary,
      fontSize: 10,
      marginTop: 3,
    },

    dangerText: {
      color: theme.error,
      fontSize: 15,
      fontWeight: "600",
    },

    actionLoading: {
      marginTop: 18,
    },

    cancelButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 10,
    },

    cancelText: {
      color:
        theme.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },

    confirmOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
      backgroundColor:
        "rgba(0, 0, 0, 0.72)",
    },

    confirmCard: {
      width: "100%",
      maxWidth: 390,
      backgroundColor:
        theme.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        theme.border,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 20,
    },

    confirmIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      backgroundColor:
        `${theme.error}12`,
      borderWidth: 1,
      borderColor:
        `${theme.error}30`,
      marginBottom: 16,
    },

    confirmTitle: {
      color:
        theme.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },

    confirmMessage: {
      color:
        theme.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 8,
    },

    confirmWarning: {
      color:
        theme.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      textAlign: "center",
      marginTop: 7,
      opacity: 0.8,
    },

    confirmActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 24,
    },

    confirmCancelButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        theme.border,
      backgroundColor:
        theme.background,
    },

    confirmCancelText: {
      color:
        theme.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },

    confirmDeleteButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius: 13,
      backgroundColor:
        theme.error,
    },

    confirmDeleteText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.6,
    },
  });