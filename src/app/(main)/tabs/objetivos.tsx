import React, {
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  Ionicons,
  Feather,
} from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

type Status =
  | "pending"
  | "accepted"
  | "disputed"
  | "sent";

type ViewMode =
  | "minhas"
  | "validar";

interface Goal {
  id: number;
  title: string;
  subtitle: string;
  group: string;
  icon: string;
  iconBg: string;
  status: Status;
  description?: string;
}

interface Validation {
  id: number;
  userName: string;
  taskTitle: string;
  group: string;
  time: string;
  userAvatar: string;
  photoUrl: string;
  isDisputed?: boolean;
  disputeReason?: string;
  disputedBy?: string;
}

// ===============================
// DADOS MOCKADOS
// ===============================

const goals: Goal[] = [
  {
    id: 1,

    title: "Treinar 1 hora",

    subtitle:
      "Marombeiros · até 22:00",

    group: "marombeiros",

    icon: "🏋️",

    iconBg: "#1a2a1a",

    status: "pending",

    description:
      "Ir à academia e completar o treino de membros inferiores.",
  },

  {
    id: 2,

    title:
      "Sem redes sociais pela manhã",

    subtitle:
      "Inateleiros · ⚠️ contestado",

    group: "inateleiros",

    icon: "📵",

    iconBg: "#1a1a2a",

    status: "disputed",

    description:
      "Ficar até as 12h sem abrir Instagram ou TikTok.",
  },
];

const pendingValidations: Validation[] = [
  {
    id: 1,

    userName: "João Victor",

    taskTitle:
      "Sem redes sociais pela manhã",

    group: "inateleiros",

    time: "Há 10 min",

    userAvatar: "JV",

    photoUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop",
  },

  {
    id: 2,

    userName: "Mateus",

    taskTitle:
      "Treinar 1 hora",

    group: "marombeiros",

    time: "Há 45 min",

    userAvatar: "MT",

    photoUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",

    isDisputed: true,

    disputeReason:
      "A foto está escura e não dá pra ver se é a academia mesmo, parece uma foto antiga.",

    disputedBy: "Diogo",
  },
];

// ===============================
// TELA
// ===============================

export default function ObjetivosScreen() {
  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState("todos");

  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>("minhas");

  const [
    selectedGoal,
    setSelectedGoal,
  ] = useState<Goal | null>(null);

  const [
    validationToReject,
    setValidationToReject,
  ] =
    useState<Validation | null>(null);

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  // ===============================
  // FILTRO OBJETIVOS
  // ===============================

  const filteredGoals = useMemo(() => {
    if (selectedFilter === "todos") {
      return goals;
    }

    return goals.filter(
      (goal) =>
        goal.group === selectedFilter
    );
  }, [selectedFilter]);

  // ===============================
  // FILTRO VALIDAÇÕES
  // ===============================

  const filteredValidations =
    useMemo(() => {
      if (selectedFilter === "todos") {
        return pendingValidations;
      }

      return pendingValidations.filter(
        (validation) =>
          validation.group ===
          selectedFilter
      );
    }, [selectedFilter]);

  // ===============================
  // STATUS
  // ===============================

  const getStatusStyle = (
    status: Status
  ) => {
    switch (status) {
      case "pending":
        return {
          bg: "#2a1e00",
          color: "#ffaa33",
          label: "Pendente",
        };

      case "accepted":
        return {
          bg: "#0a1e0a",
          color: "#33cc66",
          label: "Aceito",
        };

      case "disputed":
        return {
          bg: "#2a0a0a",
          color: "#ff5555",
          label: "Contestado",
        };

      case "sent":
        return {
          bg: "#0a1a2a",
          color: "#5599ff",
          label: "Em Análise",
        };
    }
  };

  // ===============================
  // CONTESTAÇÃO
  // ===============================

  const handleRejectSubmit = () => {
    console.log(
      "Contestação:",
      rejectionReason
    );

    setValidationToReject(null);

    setRejectionReason("");
    
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ===============================
            TÍTULO
        =============================== */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Objetivos
          </Text>
        </View>

        {/* ===============================
            TOGGLE
        =============================== */}

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setViewMode("minhas")
            }
            style={[
              styles.toggleBtn,
              viewMode === "minhas" &&
                styles.toggleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "minhas" &&
                  styles.toggleTextActive,
              ]}
            >
              Minhas Metas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setViewMode("validar")
            }
            style={[
              styles.toggleBtn,
              viewMode === "validar" &&
                styles.toggleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "validar" &&
                  styles.toggleTextActive,
              ]}
            >
              Validar Colegas
            </Text>

            {pendingValidations.length >
              0 && (
              <View
                style={
                  styles.badgeContainer
                }
              >
                <Text
                  style={styles.badgeText}
                >
                  {pendingValidations.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===============================
            FILTROS
        =============================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filtersContainer
          }
        >
          {[
            {
              label: "Todos",
              value: "todos",
            },
            {
              label: "Inateleiros",
              value: "inateleiros",
            },
            {
              label: "Marombeiros",
              value: "marombeiros",
            },
          ].map((filter) => {
            const active =
              selectedFilter ===
              filter.value;

            return (
              <TouchableOpacity
                key={filter.value}
                activeOpacity={0.8}
                onPress={() =>
                  setSelectedFilter(
                    filter.value
                  )
                }
                style={[
                  styles.chip,
                  active &&
                    styles.activeChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active &&
                      styles.activeChipText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ===============================
            TÍTULO DA LISTA
        =============================== */}

        <Text style={styles.sectionLabel}>
          {viewMode === "minhas"
            ? `Hoje · ${filteredGoals.length} objetivos`
            : `Pendentes · ${filteredValidations.length} validações`}
        </Text>

        {/* ===============================
            MINHAS METAS
        =============================== */}

        {viewMode === "minhas" ? (
          filteredGoals.map((goal) => {
            const status =
              getStatusStyle(
                goal.status
              );

            return (
              <TouchableOpacity
                key={goal.id}
                activeOpacity={0.85}
                style={styles.goalCard}
                onPress={() =>
                  setSelectedGoal(goal)
                }
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        goal.iconBg,
                    },
                  ]}
                >
                  <Text style={styles.icon}>
                    {goal.icon}
                  </Text>
                </View>

                <View style={styles.goalInfo}>
                  <Text
                    style={styles.goalTitle}
                  >
                    {goal.title}
                  </Text>

                  <Text
                    style={
                      styles.goalSubtitle
                    }
                  >
                    {goal.subtitle}
                  </Text>
                </View>

                <View
                  style={
                    styles.rightContainer
                  }
                >
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          status.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            status.color,
                        },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          /* ===============================
             VALIDAÇÕES
          =============================== */

          filteredValidations.map(
            (validation) => (
              <View
                key={validation.id}
                style={[
                  styles.validationCard,
                  validation.isDisputed &&
                    styles.validationCardDisputed,
                ]}
              >
                <View
                  style={styles.valHeader}
                >
                  <View
                    style={
                      styles.valUserArea
                    }
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor:
                            "#1a1a2a",

                          width: 40,

                          height: 40,

                          marginRight: 10,
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {
                          validation.userAvatar
                        }
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={
                          styles.goalTitle
                        }
                      >
                        {
                          validation.userName
                        }
                      </Text>

                      <Text
                        style={
                          styles.goalSubtitle
                        }
                      >
                        {
                          validation.time
                        }{" "}
                        ·{" "}
                        {
                          validation.group
                        }
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.valTaskTitle
                    }
                  >
                    {
                      validation.taskTitle
                    }
                  </Text>
                </View>

                <Image
                  source={{
                    uri: validation.photoUrl,
                  }}
                  style={
                    styles.evidenceImage
                  }
                />

                {validation.isDisputed && (
                  <View
                    style={
                      styles.disputeAlert
                    }
                  >
                    <Ionicons
                      name="warning"
                      size={20}
                      color="#ff8888"
                    />

                    <View
                      style={{ flex: 1 }}
                    >
                      <Text
                        style={
                          styles.disputeTitle
                        }
                      >
                        REVISÃO DO GRUPO
                      </Text>

                      <Text
                        style={
                          styles.disputeReason
                        }
                      >
                        {
                          validation.disputedBy
                        }{" "}
                        contestou: "
                        {
                          validation.disputeReason
                        }
                        "
                      </Text>
                    </View>
                  </View>
                )}

                <View
                  style={
                    styles.validationActions
                  }
                >
                  {validation.isDisputed ? (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.actionBtnReject,
                          styles.btnDisputeReject,
                        ]}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#ff5555"
                        />

                        <Text
                          style={
                            styles.rejectText
                          }
                        >
                          Invalidar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtnApprove,
                          styles.btnDisputeApprove,
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#33cc66"
                        />

                        <Text
                          style={
                            styles.approveText
                          }
                        >
                          Sem erros
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={
                          styles.actionBtnReject
                        }
                        onPress={() =>
                          setValidationToReject(
                            validation
                          )
                        }
                      >
                        <Ionicons
                          name="close"
                          size={24}
                          color="#ff5555"
                        />

                        <Text
                          style={
                            styles.rejectText
                          }
                        >
                          Recusar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          styles.actionBtnApprove
                        }
                      >
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color="#33cc66"
                        />

                        <Text
                          style={
                            styles.approveText
                          }
                        >
                          Aprovar
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )
          )
        )}
      </ScrollView>

      {/* ===============================
          MODAL DA META
      =============================== */}

      <Modal
        visible={!!selectedGoal}
        animationType="slide"
        onRequestClose={() =>
          setSelectedGoal(null)
        }
      >
        <SafeAreaView
          style={styles.modalContainer}
        >
          <ScrollView
            contentContainerStyle={
              styles.modalContent
            }
          >
            {selectedGoal && (
              <>
                <View
                  style={
                    styles.modalGoalHeader
                  }
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          selectedGoal.iconBg,

                        width: 64,

                        height: 64,

                        marginRight: 0,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 32,
                      }}
                    >
                      {selectedGoal.icon}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.modalGoalTitle
                    }
                  >
                    {selectedGoal.title}
                  </Text>

                  <Text
                    style={
                      styles.modalGoalGroup
                    }
                  >
                    Grupo:{" "}
                    {selectedGoal.group}
                  </Text>
                </View>

                <Text
                  style={
                    styles.modalSectionTitle
                  }
                >
                  Descrição
                </Text>

                <Text
                  style={
                    styles.modalDescription
                  }
                >
                  {selectedGoal.description}
                </Text>

                <Text
                  style={
                    styles.modalSectionTitle
                  }
                >
                  Sua Evidência
                </Text>

                <TouchableOpacity
                  style={styles.uploadArea}
                >
                  <Feather
                    name="camera"
                    size={32}
                    color="#666"
                  />

                  <Text
                    style={
                      styles.uploadText
                    }
                  >
                    Tirar foto ou gravar
                    vídeo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnPrimary}
                >
                  <Text
                    style={
                      styles.btnPrimaryText
                    }
                  >
                    Enviar para Validação
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() =>
                    setSelectedGoal(null)
                  }
                >
                  <Text
                    style={
                      styles.closeModalText
                    }
                  >
                    Fechar
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ===============================
          MODAL CONTESTAÇÃO
      =============================== */}

      <Modal
        visible={!!validationToReject}
        animationType="fade"
        transparent
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
          style={styles.overlay}
        >
          <View
            style={styles.dialogBox}
          >
            <Text
              style={styles.dialogTitle}
            >
              Contestar Evidência
            </Text>

            <Text
              style={
                styles.dialogSubtitle
              }
            >
              A foto enviada por{" "}
              {
                validationToReject?.userName
              }{" "}
              será enviada para uma nova
              votação do grupo.
            </Text>

            <TextInput
              style={styles.inputArea}
              placeholder="Ex: Foto escura, não cumpriu a regra..."
              placeholderTextColor="#666"
              multiline
              value={rejectionReason}
              onChangeText={
                setRejectionReason
              }
            />

            <View
              style={
                styles.dialogActions
              }
            >
              <TouchableOpacity
                style={
                  styles.dialogBtnCancel
                }
                onPress={() => {
                  setValidationToReject(
                    null
                  );

                  setRejectionReason("");
                }}
              >
                <Text
                  style={
                    styles.dialogBtnCancelText
                  }
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.dialogBtnConfirm
                }
                onPress={
                  handleRejectSubmit
                }
              >
                <Text
                  style={
                    styles.dialogBtnConfirmText
                  }
                >
                  Enviar Contestação
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ===============================
// ESTILOS
// ===============================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 130,
  },

  header: {
    paddingTop: 5,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
  },

  // ===============================
  // TOGGLE
  // ===============================

  toggleContainer: {
    flexDirection: "row",

    backgroundColor: "#161616",

    borderRadius: 14,

    padding: 4,

    borderWidth: 1,

    borderColor: "#1f1f1f",
  },

  toggleBtn: {
    flex: 1,

    paddingVertical: 12,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 10,

    flexDirection: "row",

    gap: 7,
  },

  toggleBtnActive: {
    backgroundColor: "#2a2a2a",
  },

  toggleText: {
    color: "#777",

    fontSize: 15,

    fontWeight: "600",
  },

  toggleTextActive: {
    color: "#fff",
  },

  badgeContainer: {
    backgroundColor: "#0a1a2a",

    paddingHorizontal: 7,

    paddingVertical: 2,

    borderRadius: 10,

    borderWidth: 1,

    borderColor: "#5599ff",
  },

  badgeText: {
    color: "#5599ff",

    fontSize: 11,

    fontWeight: "bold",
  },

  // ===============================
  // FILTROS
  // ===============================

  filtersContainer: {
    gap: 10,

    marginTop: 18,

    paddingBottom: 2,
  },

  chip: {
    paddingHorizontal: 18,

    paddingVertical: 9,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: "#222",
  },

  activeChip: {
    backgroundColor: "#fff",

    borderColor: "#fff",
  },

  chipText: {
    color: "#777",

    fontSize: 14,

    fontWeight: "500",
  },

  activeChipText: {
    color: "#000",
  },

  sectionLabel: {
    color: "#777",

    fontSize: 12,

    letterSpacing: 1,

    textTransform: "uppercase",

    marginTop: 25,

    marginBottom: 12,

    fontWeight: "600",
  },

  // ===============================
  // OBJETIVOS
  // ===============================

  goalCard: {
    marginBottom: 12,

    backgroundColor: "#161616",

    borderRadius: 18,

    borderWidth: 1,

    borderColor: "#1f1f1f",

    padding: 16,

    flexDirection: "row",

    alignItems: "center",
  },

  iconContainer: {
    width: 48,

    height: 48,

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,
  },

  icon: {
    fontSize: 22,
  },

  goalInfo: {
    flex: 1,
  },

  goalTitle: {
    color: "#fff",

    fontSize: 15,

    fontWeight: "600",
  },

  goalSubtitle: {
    color: "#777",

    fontSize: 12,

    marginTop: 3,
  },

  rightContainer: {
    alignItems: "flex-end",

    gap: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,

    fontWeight: "600",
  },

  // ===============================
  // VALIDAÇÕES
  // ===============================

  validationCard: {
    marginBottom: 16,

    backgroundColor: "#161616",

    borderRadius: 18,

    borderWidth: 1,

    borderColor: "#1f1f1f",

    overflow: "hidden",
  },

  validationCardDisputed: {
    backgroundColor: "#3a1c1c",

    borderColor: "#5a2020",
  },

  valHeader: {
    padding: 16,
  },

  valUserArea: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,
  },

  avatarText: {
    color: "#5599ff",

    fontWeight: "bold",

    fontSize: 13,
  },

  valTaskTitle: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "bold",
  },

  evidenceImage: {
    width: "100%",

    height: 200,

    backgroundColor: "#111",
  },

  disputeAlert: {
    flexDirection: "row",

    backgroundColor: "#b71212",

    padding: 16,

    gap: 12,
  },

  disputeTitle: {
    color: "#fff",

    fontSize: 13,

    fontWeight: "900",

    marginBottom: 6,
  },

  disputeReason: {
    color: "#fff",

    fontSize: 13,

    fontStyle: "italic",

    lineHeight: 18,
  },

  validationActions: {
    flexDirection: "row",

    borderTopWidth: 1,

    borderColor: "#1f1f1f",
  },

  actionBtnReject: {
    flex: 1,

    flexDirection: "row",

    paddingVertical: 16,

    justifyContent: "center",

    alignItems: "center",

    gap: 8,

    backgroundColor:
      "rgba(255,85,85,0.05)",
  },

  actionBtnApprove: {
    flex: 1,

    flexDirection: "row",

    paddingVertical: 16,

    justifyContent: "center",

    alignItems: "center",

    gap: 8,

    backgroundColor:
      "rgba(51,204,102,0.05)",

    borderLeftWidth: 1,

    borderColor: "#1f1f1f",
  },

  btnDisputeReject: {
    backgroundColor: "#3a1c1c",
  },

  btnDisputeApprove: {
    backgroundColor: "#1c2e1c",
  },

  rejectText: {
    color: "#ff5555",

    fontWeight: "600",

    fontSize: 14,
  },

  approveText: {
    color: "#33cc66",

    fontWeight: "600",

    fontSize: 14,
  },

  // ===============================
  // MODAL
  // ===============================

  modalContainer: {
    flex: 1,

    backgroundColor: "#0d0d0d",
  },

  modalContent: {
    padding: 20,

    paddingBottom: 50,
  },

  modalGoalHeader: {
    alignItems: "center",

    marginBottom: 30,
  },

  modalGoalTitle: {
    color: "#fff",

    fontSize: 24,

    fontWeight: "bold",

    marginTop: 16,

    textAlign: "center",
  },

  modalGoalGroup: {
    color: "#777",

    fontSize: 14,

    marginTop: 5,
  },

  modalSectionTitle: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "600",

    marginBottom: 10,
  },

  modalDescription: {
    color: "#999",

    fontSize: 14,

    lineHeight: 22,

    marginBottom: 30,
  },

  uploadArea: {
    height: 160,

    borderRadius: 16,

    borderWidth: 2,

    borderColor: "#222",

    borderStyle: "dashed",

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#111",

    marginBottom: 30,
  },

  uploadText: {
    color: "#666",

    marginTop: 12,

    fontSize: 14,

    fontWeight: "500",
  },

  btnPrimary: {
    backgroundColor: "#36693b",

    borderRadius: 12,

    paddingVertical: 16,

    alignItems: "center",
  },

  btnPrimaryText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "bold",
  },

  closeModalButton: {
    marginTop: 15,

    alignItems: "center",

    padding: 15,
  },

  closeModalText: {
    color: "#999",

    fontSize: 15,
  },

  // ===============================
  // MODAL CONTESTAÇÃO
  // ===============================

  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.8)",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },

  dialogBox: {
    width: "100%",

    backgroundColor: "#161616",

    borderRadius: 20,

    padding: 20,

    borderWidth: 1,

    borderColor: "#2a2a2a",
  },

  dialogTitle: {
    color: "#ff5555",

    fontSize: 18,

    fontWeight: "bold",

    marginBottom: 8,
  },

  dialogSubtitle: {
    color: "#999",

    fontSize: 13,

    marginBottom: 20,

    lineHeight: 18,
  },

  inputArea: {
    backgroundColor: "#0d0d0d",

    borderRadius: 12,

    padding: 16,

    color: "#fff",

    fontSize: 14,

    minHeight: 100,

    textAlignVertical: "top",

    borderWidth: 1,

    borderColor: "#222",

    marginBottom: 20,
  },

  dialogActions: {
    flexDirection: "row",

    gap: 12,
  },

  dialogBtnCancel: {
    flex: 1,

    paddingVertical: 14,

    borderRadius: 10,

    alignItems: "center",

    backgroundColor: "#222",
  },

  dialogBtnCancelText: {
    color: "#fff",

    fontWeight: "600",
  },

  dialogBtnConfirm: {
    flex: 1,

    paddingVertical: 14,

    borderRadius: 10,

    alignItems: "center",

    backgroundColor: "#ff5555",
  },

  dialogBtnConfirmText: {
    color: "#fff",

    fontWeight: "600",
  },
});