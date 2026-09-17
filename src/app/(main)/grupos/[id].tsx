import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { groupService } from "@/services/groupService";
import { Group, GroupRole } from "@/types/group";
import { colors } from "@/theme";

const theme = colors.dark;

export default function DetalhesGrupoScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { token, user } = useAuth();

  const currentUserId = user?.id;

  const [copied, setCopied] = useState(false);

  const [group, setGroup] =
    useState<Group | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showMenu, setShowMenu] =
    useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const carregarGrupo = useCallback(
    async () => {
      if (!token || !id) {
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
        console.error(
          "Erro ao carregar detalhes do grupo:",
          error,
        );

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Não foi possível carregar este grupo.",
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

  function voltarParaGrupos() {
    router.replace(
      "/(main)/tabs/grupos",
    );
  }

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
          getUserId(member.user) ===
          currentUserId,
      );

    return member?.role ?? null;
  }

  function getCreatorName() {
    if (!group) {
      return "";
    }

    if (
      typeof group.creator === "string"
    ) {
      return "Criador do grupo";
    }

    return group.creator.name;
  }

  function irParaRanking() {
    if (!group) {
      return;
    }

    router.push({
      pathname: "/ranking/[id]",
      params: {
        id: group._id,
      },
    });
  }

  function irParaObjetivos() {
    router.push("/tabs/objetivos");
  }

  function irParaMembros() {
    if (!id) {
      return;
    }

    router.push({
      pathname: "/(main)/grupos/[id]/membros",
      params: {
        id,
      },
    });
  }
  
  function handleEditarGrupo() {
    if (!id) {
      return;
    }

    setShowMenu(false);

    router.push({
      pathname:
        "/(main)/grupos/[id]/editar",
      params: {
        id,
      },
    });
  }

 function handleSairGrupo() {
    setShowMenu(false);
    setLeaveError("");
    setShowLeaveModal(true);
  }

  async function confirmarSaida() {
    if (!id || !token) {
      return;
    }

    try {
      setIsLeaving(true);
      setLeaveError("");

      await groupService.leaveGroup(
        id,
        token,
      );

      setShowLeaveModal(false);

      router.replace(
        "/(main)/tabs/grupos",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setLeaveError(error.message);
      } else {
        setLeaveError(
          "Não foi possível sair do grupo.",
        );
      }
    } finally {
      setIsLeaving(false);
    }
  }

  function handleExcluirGrupo() {
    setShowMenu(false);
    setDeleteError("");
    setShowDeleteModal(true);
  }
  async function confirmarExclusao() {
    if (!id || !token) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await groupService.deleteGroup(
        id,
        token,
      );

      setShowDeleteModal(false);

      router.replace(
        "/(main)/tabs/grupos",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteError(error.message);
      } else {
        setDeleteError(
          "Não foi possível excluir o grupo.",
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCopyCode() {
    if (!group) {
      return;
    }

    await Clipboard.setStringAsync(
      group.code,
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  const currentUserRole =
    getCurrentUserRole();

  const isAdmin =
    currentUserRole === "admin";

  const creatorId = group
    ? getUserId(group.creator)
    : null;

  const isCreator =
    !!currentUserId &&
    creatorId === currentUserId;

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
            style={styles.feedbackText}
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
          <View
            style={styles.errorIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={theme.error}
            />
          </View>

          <Text
            style={styles.errorTitle}
          >
            Não foi possível abrir o
            grupo
          </Text>

          <Text
            style={styles.errorText}
          >
            {error ||
              "Os dados deste grupo não foram encontrados."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
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
              styles.backErrorButton
            }
            onPress={voltarParaGrupos}
          >
            <Text
              style={
                styles.backErrorText
              }
            >
              Voltar para grupos
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
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={voltarParaGrupos}
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
              Grupos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              setShowMenu(true)
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={
                theme.textPrimary
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View
            style={styles.titleRow}
          >
            <View
              style={styles.groupIcon}
            >
              <Ionicons
                name="people-outline"
                size={22}
                color={
                  theme.secondary
                }
              />
            </View>

            {isAdmin ? (
              <View
                style={
                  styles.adminBadge
                }
              >
                <Text
                  style={
                    styles.adminBadgeText
                  }
                >
                  Admin
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>
            {group.name}
          </Text>

          {group.description ? (
            <Text
              style={
                styles.description
              }
            >
              {group.description}
            </Text>
          ) : null}

          <View
            style={styles.metaRow}
          >
            <Ionicons
              name="people-outline"
              size={14}
              color={
                theme.textSecondary
              }
            />

            <Text
              style={styles.metaText}
            >
              {group.members.length}{" "}
              {group.members.length ===
              1
                ? "membro"
                : "membros"}
            </Text>

            <View
              style={styles.dot}
            />

            <Text
              style={styles.metaText}
            >
              limite{" "}
              {group.maxMembers}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.inviteSection
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              CÓDIGO DE CONVITE
            </Text>

            <Ionicons
              name="key-outline"
              size={16}
              color={
                theme.secondary
              }
            />
          </View>

          <View
            style={styles.codeCard}
          >
            <View>
              <Text
                style={
                  styles.codeValue
                }
                selectable
              >
                {group.code}
              </Text>

              <Text
                style={
                  styles.codeHint
                }
              >
                {copied
                  ? "Código copiado!"
                  : "Toque no ícone para copiar"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.codeIcon}
              onPress={
                handleCopyCode
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  copied
                    ? "checkmark"
                    : "copy-outline"
                }
                size={19}
                color={
                  copied
                    ? theme.success
                    : theme.secondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={styles.menuSection}
        >
          <TouchableOpacity
            style={
              styles.navigationRow
            }
            onPress={irParaMembros}
            activeOpacity={0.75}
          >
            <View
              style={
                styles.navigationLeft
              }
            >
              <View
                style={
                  styles.navigationIcon
                }
              >
                <Ionicons
                  name="people-outline"
                  size={21}
                  color={
                    theme.secondary
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.navigationTitle
                  }
                >
                  Membros
                </Text>

                <Text
                  style={
                    styles.navigationSubtitle
                  }
                >
                  {
                    group.members
                      .length
                  }{" "}
                  de{" "}
                  {
                    group.maxMembers
                  }{" "}
                  participantes
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                theme.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.navigationRow
            }
            onPress={irParaRanking}
            activeOpacity={0.75}
          >
            <View
              style={
                styles.navigationLeft
              }
            >
              <View
                style={
                  styles.navigationIcon
                }
              >
                <Ionicons
                  name="trophy-outline"
                  size={21}
                  color={
                    theme.secondary
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.navigationTitle
                  }
                >
                  Ranking
                </Text>

                <Text
                  style={
                    styles.navigationSubtitle
                  }
                >
                  Pontuação dos
                  membros
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                theme.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.navigationRow
            }
            onPress={
              irParaObjetivos
            }
            activeOpacity={0.75}
          >
            <View
              style={
                styles.navigationLeft
              }
            >
              <View
                style={
                  styles.navigationIcon
                }
              >
                <Ionicons
                  name="flag-outline"
                  size={21}
                  color={
                    theme.primary
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.navigationTitle
                  }
                >
                  Objetivos
                </Text>

                <Text
                  style={
                    styles.navigationSubtitle
                  }
                >
                  Tarefas e metas do
                  grupo
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                theme.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.creatorText}
        >
          Criado por{" "}
          {getCreatorName()}
        </Text>
      </ScrollView>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMenu(false)
        }
      >
        <TouchableOpacity
          style={
            styles.modalOverlay
          }
          activeOpacity={1}
          onPress={() =>
            setShowMenu(false)
          }
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

            <Text
              style={
                styles.sheetTitle
              }
            >
              Opções do grupo
            </Text>

            {isAdmin ? (
              <TouchableOpacity
                style={
                  styles.actionRow
                }
                onPress={
                  handleEditarGrupo
                }
              >
                <Ionicons
                  name="create-outline"
                  size={21}
                  color={
                    theme.textPrimary
                  }
                />

                <View>
                  <Text
                    style={
                      styles.actionText
                    }
                  >
                    Editar grupo
                  </Text>

                  <Text
                    style={
                      styles.actionSubtitle
                    }
                  >
                    Nome, descrição,
                    senha e limite
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {!isCreator ? (
              <TouchableOpacity
                style={
                  styles.actionRow
                }
                onPress={
                  handleSairGrupo
                }
              >
                <Ionicons
                  name="exit-outline"
                  size={21}
                  color={
                    theme.error
                  }
                />

                <Text
                  style={
                    styles.dangerText
                  }
                >
                  Sair do grupo
                </Text>
              </TouchableOpacity>
            ) : null}

            {isCreator ? (
              <TouchableOpacity
                style={
                  styles.actionRow
                }
                onPress={
                  handleExcluirGrupo
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color={
                    theme.error
                  }
                />

                <View>
                  <Text
                    style={
                      styles.dangerText
                    }
                  >
                    Excluir grupo
                  </Text>

                  <Text
                    style={
                      styles.actionSubtitle
                    }
                  >
                    Esta ação encerra o
                    grupo
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={
                styles.cancelMenuButton
              }
              onPress={() =>
                setShowMenu(false)
              }
            >
              <Text
                style={
                  styles.cancelMenuText
                }
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isLeaving) {
            setShowLeaveModal(false);
          }
        }}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconContainer}>
              <Ionicons
                name="exit-outline"
                size={28}
                color={theme.error}
              />
            </View>

            <Text style={styles.confirmTitle}>
              Sair do grupo?
            </Text>

            <Text style={styles.confirmDescription}>
              Você deixará de participar deste grupo.
              Para voltar, será necessário entrar novamente.
            </Text>

            {leaveError ? (
              <View style={styles.leaveErrorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={theme.error}
                />

                <Text style={styles.leaveErrorText}>
                  {leaveError}
                </Text>
              </View>
            ) : null}

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => {
                  if (!isLeaving) {
                    setShowLeaveModal(false);
                    setLeaveError("");
                  }
                }}
                disabled={isLeaving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelConfirmText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.leaveConfirmButton,
                  isLeaving && styles.disabledConfirmButton,
                ]}
                onPress={confirmarSaida}
                disabled={isLeaving}
                activeOpacity={0.8}
              >
                {isLeaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="exit-outline"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text style={styles.leaveConfirmText}>
                      Sair
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
          }
        }}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.deleteIconContainer}>
              <Ionicons
                name="trash-outline"
                size={28}
                color={theme.error}
              />
            </View>

            <Text style={styles.confirmTitle}>
              Excluir grupo?
            </Text>

            <Text style={styles.confirmDescription}>
              Essa ação é permanente. O grupo será excluído
              e todos os participantes perderão o acesso.
            </Text>

            {deleteError ? (
              <View style={styles.leaveErrorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={theme.error}
                />

                <Text style={styles.leaveErrorText}>
                  {deleteError}
                </Text>
              </View>
            ) : null}

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                    setDeleteError("");
                  }
                }}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelConfirmText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteConfirmButton,
                  isDeleting && styles.disabledConfirmButton,
                ]}
                onPress={confirmarExclusao}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text style={styles.deleteConfirmText}>
                      Excluir
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      theme.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 42,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 25,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  backButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginBottom: 30,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 15,
  },

  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${theme.secondary}14`,
    borderWidth: 1,
    borderColor:
      `${theme.secondary}35`,
  },

  adminBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor:
      `${theme.secondary}12`,
    borderWidth: 1,
    borderColor:
      `${theme.secondary}35`,
  },

  adminBadgeText: {
    color: theme.secondary,
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    color: theme.textPrimary,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 9,
  },

  description: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    color: theme.textSecondary,
    fontSize: 12,
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor:
      theme.textSecondary,
    opacity: 0.5,
    marginHorizontal: 2,
  },

  inviteSection: {
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 9,
  },

  sectionLabel: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },

  codeCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 15,
    backgroundColor:
      theme.surface,
    borderWidth: 1,
    borderColor:
      `${theme.secondary}35`,
    borderRadius: 16,
  },

  codeValue: {
    color: theme.textPrimary,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  codeHint: {
    color: theme.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },

  codeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${theme.secondary}10`,
  },

  menuSection: {
    backgroundColor:
      theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    overflow: "hidden",
  },

  navigationRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor:
      theme.border,
  },

  navigationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  navigationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      theme.background,
  },

  navigationTitle: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  navigationSubtitle: {
    color: theme.textSecondary,
    fontSize: 11,
  },

  creatorText: {
    color: theme.textSecondary,
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
  },

  feedbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 70,
  },

  feedbackText: {
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },

  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${theme.error}10`,
  },

  errorTitle: {
    color: theme.textPrimary,
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 7,
  },

  errorText: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor:
      theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: theme.textPrimary,
    fontWeight: "600",
  },

  backErrorButton: {
    marginTop: 17,
  },

  backErrorText: {
    color: theme.secondary,
    fontSize: 13,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  actionRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderBottomWidth: 1,
    borderBottomColor:
      theme.border,
  },

  actionText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  actionSubtitle: {
    color: theme.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  dangerText: {
    color: theme.error,
    fontSize: 15,
    fontWeight: "600",
  },

  cancelMenuButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  cancelMenuText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
},

confirmModal: {
  width: "100%",
  maxWidth: 380,
  backgroundColor: theme.surface,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: theme.border,
  padding: 22,
  alignItems: "center",
},

confirmIconContainer: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: `${theme.error}15`,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
},

confirmTitle: {
  color: theme.textPrimary,
  fontSize: 19,
  fontWeight: "700",
},

confirmDescription: {
  color: theme.textSecondary,
  fontSize: 12,
  lineHeight: 18,
  textAlign: "center",
  marginTop: 8,
  marginBottom: 20,
  maxWidth: 290,
},

confirmActions: {
  width: "100%",
  flexDirection: "row",
  gap: 10,
},

cancelConfirmButton: {
  flex: 1,
  minHeight: 46,
  borderRadius: 13,
  borderWidth: 1,
  borderColor: theme.border,
  alignItems: "center",
  justifyContent: "center",
},

cancelConfirmText: {
  color: theme.textPrimary,
  fontSize: 13,
  fontWeight: "600",
},

leaveConfirmButton: {
  flex: 1,
  minHeight: 46,
  borderRadius: 13,
  backgroundColor: theme.error,
  flexDirection: "row",
  gap: 6,
  alignItems: "center",
  justifyContent: "center",
},

leaveConfirmText: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "700",
},

disabledConfirmButton: {
  opacity: 0.6,
},

leaveErrorBox: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  backgroundColor: `${theme.error}10`,
  borderWidth: 1,
  borderColor: `${theme.error}40`,
  borderRadius: 11,
  padding: 10,
  marginBottom: 16,
},

leaveErrorText: {
  flex: 1,
  color: theme.error,
  fontSize: 11,
  lineHeight: 15,
},
deleteIconContainer: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: `${theme.error}15`,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
},

deleteConfirmButton: {
  flex: 1,
  minHeight: 46,
  borderRadius: 13,
  backgroundColor: theme.error,
  flexDirection: "row",
  gap: 6,
  alignItems: "center",
  justifyContent: "center",
},

deleteConfirmText: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "700",
},

});