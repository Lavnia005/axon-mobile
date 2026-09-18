import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { taskService } from "@/services/taskService";
import { colors } from "@/theme";
import { Task } from "@/types/task";

const theme = colors.dark;

const UI = {
  purple: "#7A5AF8",
  purpleBright: "#8B6CFF",
  purpleSoft: "#B9A8FF",

  purpleDark: "#211542",
  purpleSurface: "#2C1D5B",
  purpleSurfaceStrong: "#392176",
  purpleBorder: "#6747D7",

  blueSurface: "#192441",
  softSurface: "#151C2B",
  surfaceRaised: "#1B2335",

  muted: "#717C91",
};

type ViewMode =
  | "tasks"
  | "validation";

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

/*
 * TEMPORÁRIO
 *
 * Será substituído pelos dados reais
 * de Task Submissions.
 */
const pendingValidations: Validation[] = [
  {
    id: 1,
    userName: "João Victor",
    taskTitle:
      "Sem redes sociais pela manhã",
    group: "Inateleiros",
    time: "Há 10 min",
    userAvatar: "JV",
    photoUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    userName: "Mateus",
    taskTitle: "Treinar 1 hora",
    group: "Marombeiros",
    time: "Há 45 min",
    userAvatar: "MT",
    photoUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",

    isDisputed: true,

    disputeReason:
      "A foto está escura e não dá para confirmar se o objetivo foi realmente cumprido.",

    disputedBy: "Diogo",
  },
];

function getTaskGroupId(
  group: Task["group"],
) {
  if (typeof group === "string") {
    return group;
  }

  return group._id;
}

function getTaskGroupName(
  group: Task["group"],
) {
  if (typeof group === "string") {
    return "Grupo";
  }

  return group.name;
}

function formatDateTime(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatDeadline(
  value: string,
) {
  const deadline = new Date(value);

  if (
    Number.isNaN(
      deadline.getTime(),
    )
  ) {
    return "Prazo indisponível";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const deadlineDay = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
  );

  const differenceInDays =
    Math.round(
      (deadlineDay.getTime() -
        today.getTime()) /
        86400000,
    );

  const time =
    deadline.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  if (differenceInDays === 0) {
    return `Hoje às ${time}`;
  }

  if (differenceInDays === 1) {
    return `Amanhã às ${time}`;
  }

  return deadline.toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function ObjetivosScreen() {
  const { token } = useAuth();

  const params =
    useLocalSearchParams<{
      groupId?: string | string[];
    }>();

  const requestedGroupId =
    Array.isArray(params.groupId)
      ? params.groupId[0]
      : params.groupId;

  const [
    viewMode,
    setViewMode,
  ] =
    useState<ViewMode>("tasks");

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState("todos");

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>([]);

  const [
    selectedTask,
    setSelectedTask,
  ] =
    useState<Task | null>(
      null,
    );

  const [
    isLoadingTasks,
    setIsLoadingTasks,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    tasksError,
    setTasksError,
  ] = useState("");

  const [
    showHelp,
    setShowHelp,
  ] = useState(false);

  const [
    validationToContest,
    setValidationToContest,
  ] =
    useState<Validation | null>(
      null,
    );

  const [
    contestReason,
    setContestReason,
  ] = useState("");

  const carregarTarefas =
    useCallback(
      async (
        refreshing = false,
      ) => {
        if (!token) {
          setTasks([]);

          setIsLoadingTasks(
            false,
          );

          return;
        }

        try {
          if (refreshing) {
            setIsRefreshing(
              true,
            );
          } else {
            setIsLoadingTasks(
              true,
            );
          }

          setTasksError("");

          const response =
            await taskService.getMyTasks(
              token,
            );

          setTasks(
            response.tasks,
          );
        } catch (error) {
          console.error(
            "Erro ao carregar objetivos:",
            error,
          );

          if (
            error instanceof
            ApiError
          ) {
            setTasksError(
              error.message,
            );
          } else {
            setTasksError(
              "Não foi possível carregar os objetivos.",
            );
          }
        } finally {
          setIsLoadingTasks(
            false,
          );

          setIsRefreshing(
            false,
          );
        }
      },
      [token],
    );

  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [carregarTarefas]),
  );

  const taskFilters =
    useMemo(() => {
      const groups =
        new Map<
          string,
          string
        >();

      tasks.forEach(
        (task) => {
          groups.set(
            getTaskGroupId(
              task.group,
            ),
            getTaskGroupName(
              task.group,
            ),
          );
        },
      );

      return [
        {
          label: "Todos",
          value: "todos",
        },

        ...Array.from(
          groups.entries(),
        ).map(
          ([
            value,
            label,
          ]) => ({
            value,
            label,
          }),
        ),
      ];
    }, [tasks]); 

  useFocusEffect(
  useCallback(() => {
    if (
      !requestedGroupId ||
      tasks.length === 0
    ) {
      return;
    }

    const hasTasksFromGroup =
      tasks.some(
        (task) =>
          getTaskGroupId(
            task.group,
          ) === requestedGroupId,
      );

    if (hasTasksFromGroup) {
      setViewMode("tasks");

      setSelectedFilter(
        requestedGroupId,
      );
    }
  }, [
    requestedGroupId,
    tasks,
  ]),
);

  const validationFilters =
    useMemo(() => {
      const groups =
        Array.from(
          new Set(
            pendingValidations.map(
              (
                validation,
              ) =>
                validation.group,
            ),
          ),
        );

      return [
        {
          label: "Todos",
          value: "todos",
        },

        ...groups.map(
          (group) => ({
            value: group,
            label: group,
          }),
        ),
      ];
    }, []);

  const availableFilters =
    viewMode === "tasks"
      ? taskFilters
      : validationFilters;

  /*
   * Se existe apenas um grupo,
   * não faz sentido mostrar
   * "Todos / Nome do grupo".
   */
  const shouldShowFilters =
    availableFilters.length >
    2;

  const filteredTasks =
    useMemo(() => {
      if (
        selectedFilter ===
        "todos"
      ) {
        return tasks;
      }

      return tasks.filter(
        (task) =>
          getTaskGroupId(
            task.group,
          ) ===
          selectedFilter,
      );
    }, [
      tasks,
      selectedFilter,
    ]);

  const filteredValidations =
    useMemo(() => {
      if (
        selectedFilter ===
        "todos"
      ) {
        return pendingValidations;
      }

      return pendingValidations.filter(
        (validation) =>
          validation.group ===
          selectedFilter,
      );
    }, [selectedFilter]);

  const totalPoints =
    useMemo(() => {
      return filteredTasks.reduce(
        (
          total,
          task,
        ) =>
          total +
          task.points,
        0,
      );
    }, [filteredTasks]);

  const votingCount =
    useMemo(() => {
      return filteredValidations.filter(
        (validation) =>
          validation.isDisputed,
      ).length;
    }, [
      filteredValidations,
    ]);

  function changeView(
    mode: ViewMode,
  ) {
    setViewMode(mode);

    setSelectedFilter(
      "todos",
    );
  }

  function closeContestModal() {
    setValidationToContest(
      null,
    );

    setContestReason("");
  }

  function handleContest() {
    if (
      !contestReason.trim()
    ) {
      return;
    }

    console.log(
      "Motivo da contestação:",
      contestReason,
    );

    closeContestModal();
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
          styles.scrollContent
        }
        refreshControl={
          viewMode ===
          "tasks" ? (
            <RefreshControl
              refreshing={
                isRefreshing
              }
              onRefresh={() =>
                carregarTarefas(
                  true,
                )
              }
              tintColor={
                theme.primary
              }
              colors={[
                theme.primary,
              ]}
            />
          ) : undefined
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerTitleArea
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Objetivos
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Transforme constância
              em evolução.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={
              0.8
            }
            style={
              styles.helpButton
            }
            onPress={() =>
              setShowHelp(true)
            }
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={
                theme.textPrimary
              }
            />
          </TouchableOpacity>
        </View>

        {/* ABAS */}

        <View
          style={
            styles.segmentContainer
          }
        >
          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={[
              styles.segmentButton,

              viewMode ===
                "tasks" &&
                styles.segmentButtonActive,
            ]}
            onPress={() =>
              changeView(
                "tasks",
              )
            }
          >
            <Ionicons
              name="flag-outline"
              size={18}
              color={
                viewMode ===
                "tasks"
                  ? "#FFFFFF"
                  : theme.textSecondary
              }
            />

            <Text
              style={[
                styles.segmentText,

                viewMode ===
                  "tasks" &&
                  styles.segmentTextActive,
              ]}
            >
              Objetivos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={[
              styles.segmentButton,

              viewMode ===
                "validation" &&
                styles.segmentButtonActive,
            ]}
            onPress={() =>
              changeView(
                "validation",
              )
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={
                viewMode ===
                "validation"
                  ? "#FFFFFF"
                  : theme.textSecondary
              }
            />

            <Text
              style={[
                styles.segmentText,

                viewMode ===
                  "validation" &&
                  styles.segmentTextActive,
              ]}
            >
              Validar
            </Text>

            {pendingValidations.length >
              0 && (
              <View
                style={
                  styles.segmentBadge
                }
              >
                <Text
                  style={
                    styles.segmentBadgeText
                  }
                >
                  {
                    pendingValidations.length
                  }
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* RESUMO GAMIFICADO */}

        {viewMode ===
        "tasks" ? (
          <LinearGradient
            colors={[
              "#18213A",
              "#291B55",
              "#181D32",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.progressCard
            }
          >
            <View
              style={
                styles.progressTop
              }
            >
              <View
                style={
                  styles.progressSymbol
                }
              >
                <Ionicons
                  name="flash"
                  size={23}
                  color="#C9BEFF"
                />
              </View>

              <View
                style={
                  styles.progressTitleArea
                }
              >
                <Text
                  style={
                    styles.progressLabel
                  }
                >
                  PROGRESSO ATUAL
                </Text>

                <Text
                  style={
                    styles.progressTitle
                  }
                >
                  Continue avançando
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.progressDescription
              }
            >
              Cada objetivo
              cumprido soma pontos
              ao seu grupo e leva
              você mais longe no
              ranking.
            </Text>

            <View
              style={
                styles.progressStats
              }
            >
              <View
                style={
                  styles.progressStat
                }
              >
                <Text
                  style={
                    styles.progressStatValue
                  }
                >
                  {
                    filteredTasks.length
                  }
                </Text>

                <Text
                  style={
                    styles.progressStatLabel
                  }
                >
                  objetivos ativos
                </Text>
              </View>

              <View
                style={
                  styles.progressDivider
                }
              />

              <View
                style={
                  styles.progressStat
                }
              >
                <Text
                  style={
                    styles.progressStatValuePurple
                  }
                >
                  {totalPoints}
                </Text>

                <Text
                  style={
                    styles.progressStatLabel
                  }
                >
                  pontos em jogo
                </Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={[
              "#251747",
              "#171D32",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.validationSummary
            }
          >
            <View
              style={
                styles.validationSummaryIcon
              }
            >
              <Ionicons
                name="people-outline"
                size={23}
                color="#C6B8FF"
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.validationSummaryTitle
                }
              >
                Ajude seu grupo
              </Text>

              <Text
                style={
                  styles.validationSummaryText
                }
              >
                {
                  filteredValidations.length
                }{" "}
                evidências aguardam
                análise
                {votingCount > 0
                  ? ` · ${votingCount} em votação`
                  : ""}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* FILTROS */}

        {shouldShowFilters && (
          <View
            style={
              styles.filterSection
            }
          >
            <View
              style={
                styles.filterHeader
              }
            >
              <View
                style={
                  styles.filterHeaderLeft
                }
              >
                <Ionicons
                  name="filter-outline"
                  size={14}
                  color={
                    theme.textSecondary
                  }
                />

                <Text
                  style={
                    styles.filterLabel
                  }
                >
                  Filtrar por grupo
                </Text>
              </View>

              {selectedFilter !==
                "todos" && (
                <TouchableOpacity
                  onPress={() =>
                    setSelectedFilter(
                      "todos",
                    )
                  }
                >
                  <Text
                    style={
                      styles.clearFilter
                    }
                  >
                    Limpar
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filtersContainer
              }
            >
              {availableFilters.map(
                (filter) => {
                  const active =
                    selectedFilter ===
                    filter.value;

                  return (
                    <TouchableOpacity
                      key={
                        filter.value
                      }
                      activeOpacity={
                        0.85
                      }
                      style={[
                        styles.filterChip,

                        active &&
                          styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setSelectedFilter(
                          filter.value,
                        )
                      }
                    >
                      {active && (
                        <View
                          style={
                            styles.filterActiveDot
                          }
                        />
                      )}

                      <Text
                        style={[
                          styles.filterText,

                          active &&
                            styles.filterTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </ScrollView>
          </View>
        )}

        {/* SEÇÃO */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              {viewMode ===
              "tasks"
                ? "Em andamento"
                : "Para você analisar"}
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {viewMode ===
              "tasks"
                ? "Suas missões disponíveis agora"
                : "Sua decisão também faz parte do jogo"}
            </Text>
          </View>

          {viewMode ===
            "tasks" &&
            filteredTasks.length >
              0 && (
              <View
                style={
                  styles.sectionCounter
                }
              >
                <Text
                  style={
                    styles.sectionCounterText
                  }
                >
                  {
                    filteredTasks.length
                  }
                </Text>
              </View>
            )}
        </View>

        {/* OBJETIVOS */}

        {viewMode ===
        "tasks" ? (
          <>
            {isLoadingTasks ? (
              <View
                style={
                  styles.simpleState
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    UI.purpleBright
                  }
                />

                <Text
                  style={
                    styles.stateTitle
                  }
                >
                  Carregando objetivos
                </Text>

                <Text
                  style={
                    styles.stateDescription
                  }
                >
                  Preparando suas
                  próximas missões.
                </Text>
              </View>
            ) : tasksError ? (
              <View
                style={
                  styles.simpleState
                }
              >
                <View
                  style={
                    styles.errorIcon
                  }
                >
                  <Ionicons
                    name="cloud-offline-outline"
                    size={28}
                    color={
                      theme.error
                    }
                  />
                </View>

                <Text
                  style={
                    styles.stateTitle
                  }
                >
                  Não conseguimos
                  carregar
                </Text>

                <Text
                  style={
                    styles.stateDescription
                  }
                >
                  {tasksError}
                </Text>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.retryButton
                  }
                  onPress={() =>
                    carregarTarefas()
                  }
                >
                  <Ionicons
                    name="refresh"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.retryText
                    }
                  >
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </View>
            ) : filteredTasks.length ===
              0 ? (
              <View
                style={
                  styles.emptyState
                }
              >
                <View
                  style={
                    styles.emptyDecoration
                  }
                >
                  <View
                    style={
                      styles.emptyRingOuter
                    }
                  />

                  <View
                    style={
                      styles.emptyRingInner
                    }
                  />

                  <LinearGradient
                    colors={[
                      "#5C39D6",
                      "#394FE0",
                    ]}
                    start={{
                      x: 0,
                      y: 0,
                    }}
                    end={{
                      x: 1,
                      y: 1,
                    }}
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Ionicons
                      name="flag-outline"
                      size={31}
                      color="#E0D9FF"
                    />
                  </LinearGradient>
                </View>

                <Text
                  style={
                    styles.stateTitle
                  }
                >
                  Nenhuma missão ativa
                </Text>

                <Text
                  style={
                    styles.stateDescription
                  }
                >
                  Assim que um novo
                  objetivo for criado
                  em algum dos seus
                  grupos, ele
                  aparecerá aqui.
                </Text>

                <View
                  style={
                    styles.emptyHint
                  }
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={15}
                    color={
                      UI.purpleSoft
                    }
                  />

                  <Text
                    style={
                      styles.emptyHintText
                    }
                  >
                    Prepare-se para o
                    próximo desafio
                  </Text>
                </View>
              </View>
            ) : (
              filteredTasks.map(
                (task) => (
                  <TouchableOpacity
                    key={task._id}
                    activeOpacity={
                      0.87
                    }
                    style={
                      styles.taskCard
                    }
                    onPress={() =>
                      setSelectedTask(
                        task,
                      )
                    }
                  >
                    <LinearGradient
                      colors={[
                        "#3A276F",
                        "#222C51",
                      ]}
                      start={{
                        x: 0,
                        y: 0,
                      }}
                      end={{
                        x: 1,
                        y: 1,
                      }}
                      style={
                        styles.taskIcon
                      }
                    >
                      <Ionicons
                        name="flag"
                        size={19}
                        color="#D3C8FF"
                      />
                    </LinearGradient>

                    <View
                      style={
                        styles.taskMain
                      }
                    >
                      <View
                        style={
                          styles.taskMetaTop
                        }
                      >
                        <Text
                          style={
                            styles.taskGroup
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {getTaskGroupName(
                            task.group,
                          )}
                        </Text>

                        <View
                          style={
                            styles.pointsBadge
                          }
                        >
                          <Ionicons
                            name="sparkles"
                            size={12}
                            color={
                              UI.purpleSoft
                            }
                          />

                          <Text
                            style={
                              styles.pointsText
                            }
                          >
                            +
                            {
                              task.points
                            }
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={
                          styles.taskTitle
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {task.title}
                      </Text>

                      {task.description?.trim() ? (
                        <Text
                          style={
                            styles.taskDescription
                          }
                          numberOfLines={
                            2
                          }
                        >
                          {
                            task.description
                          }
                        </Text>
                      ) : null}

                      <View
                        style={
                          styles.taskFooter
                        }
                      >
                        <View
                          style={
                            styles.deadlineArea
                          }
                        >
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={
                              theme.textSecondary
                            }
                          />

                          <Text
                            style={
                              styles.deadlineText
                            }
                          >
                            {formatDeadline(
                              task.deadline,
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.cardArrow
                          }
                        >
                          <Ionicons
                            name="chevron-forward"
                            size={15}
                            color="#8994AC"
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ),
              )
            )}
          </>
        ) : (
          <>
            {filteredValidations.length ===
            0 ? (
              <View
                style={
                  styles.emptyState
                }
              >
                <View
                  style={
                    styles.successIcon
                  }
                >
                  <Ionicons
                    name="checkmark-done"
                    size={30}
                    color={
                      theme.success
                    }
                  />
                </View>

                <Text
                  style={
                    styles.stateTitle
                  }
                >
                  Tudo em dia
                </Text>

                <Text
                  style={
                    styles.stateDescription
                  }
                >
                  Nenhuma evidência
                  precisa da sua análise
                  agora.
                </Text>
              </View>
            ) : (
              filteredValidations.map(
                (
                  validation,
                ) => {
                  /*
                   * VOTAÇÃO
                   */
                  if (
                    validation.isDisputed
                  ) {
                    return (
                      <View
                        key={
                          validation.id
                        }
                        style={
                          styles.votingCard
                        }
                      >
                        <LinearGradient
                          colors={[
                            "#4A2487",
                            "#311D64",
                            "#211744",
                          ]}
                          start={{
                            x: 0,
                            y: 0,
                          }}
                          end={{
                            x: 1,
                            y: 1,
                          }}
                          style={
                            styles.votingBanner
                          }
                        >
                          <View
                            style={
                              styles.votingBannerIcon
                            }
                          >
                            <Ionicons
                              name="megaphone-outline"
                              size={19}
                              color="#E2DBFF"
                            />
                          </View>

                          <View
                            style={{
                              flex: 1,
                            }}
                          >
                            <Text
                              style={
                                styles.votingBannerTitle
                              }
                            >
                              VOTAÇÃO EM
                              ANDAMENTO
                            </Text>

                            <Text
                              style={
                                styles.votingBannerSubtitle
                              }
                            >
                              A evidência
                              foi contestada
                            </Text>
                          </View>

                          <View
                            style={
                              styles.liveBadge
                            }
                          >
                            <View
                              style={
                                styles.liveDot
                              }
                            />

                            <Text
                              style={
                                styles.liveText
                              }
                            >
                              ABERTA
                            </Text>
                          </View>
                        </LinearGradient>

                        <View
                          style={
                            styles.validationHeader
                          }
                        >
                          <View
                            style={
                              styles.validationUserRow
                            }
                          >
                            <View
                              style={
                                styles.votingAvatar
                              }
                            >
                              <Text
                                style={
                                  styles.votingAvatarText
                                }
                              >
                                {
                                  validation.userAvatar
                                }
                              </Text>
                            </View>

                            <View
                              style={{
                                flex: 1,
                              }}
                            >
                              <Text
                                style={
                                  styles.validationUserName
                                }
                              >
                                {
                                  validation.userName
                                }
                              </Text>

                              <Text
                                style={
                                  styles.validationMeta
                                }
                              >
                                {
                                  validation.group
                                }{" "}
                                ·{" "}
                                {
                                  validation.time
                                }
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={
                              styles.validationTaskTitle
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
                            styles.votingImage
                          }
                        />

                        <View
                          style={
                            styles.votingReason
                          }
                        >
                          <View
                            style={
                              styles.votingReasonTitleRow
                            }
                          >
                            <Ionicons
                              name="chatbubble-ellipses-outline"
                              size={16}
                              color={
                                UI.purpleSoft
                              }
                            />

                            <Text
                              style={
                                styles.votingReasonTitle
                              }
                            >
                              Por que foi
                              contestada?
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.votingReasonText
                            }
                          >
                            <Text
                              style={
                                styles.votingReasonAuthor
                              }
                            >
                              {
                                validation.disputedBy
                              }
                              :{" "}
                            </Text>

                            {
                              validation.disputeReason
                            }
                          </Text>
                        </View>

                        <View
                          style={
                            styles.voteDecision
                          }
                        >
                          <Text
                            style={
                              styles.voteQuestion
                            }
                          >
                            Qual é a sua
                            decisão?
                          </Text>

                          <Text
                            style={
                              styles.voteHint
                            }
                          >
                            Seu voto ajuda o
                            grupo a resolver
                            a contestação.
                          </Text>
                        </View>

                        <View
                          style={
                            styles.votingActions
                          }
                        >
                          <TouchableOpacity
                            activeOpacity={
                              0.85
                            }
                            style={
                              styles.invalidateButton
                            }
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={18}
                              color={
                                theme.error
                              }
                            />

                            <Text
                              style={
                                styles.invalidateText
                              }
                            >
                              Invalidar
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={
                              0.85
                            }
                            style={
                              styles.keepValidButton
                            }
                          >
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={18}
                              color="#FFFFFF"
                            />

                            <Text
                              style={
                                styles.keepValidText
                              }
                            >
                              Manter válida
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }

                  /*
                   * VALIDAÇÃO NORMAL
                   */
                  return (
                    <View
                      key={
                        validation.id
                      }
                      style={
                        styles.validationCard
                      }
                    >
                      <View
                        style={
                          styles.validationHeader
                        }
                      >
                        <View
                          style={
                            styles.validationUserRow
                          }
                        >
                          <View
                            style={
                              styles.avatar
                            }
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

                          <View
                            style={{
                              flex: 1,
                            }}
                          >
                            <Text
                              style={
                                styles.validationUserName
                              }
                            >
                              {
                                validation.userName
                              }
                            </Text>

                            <Text
                              style={
                                styles.validationMeta
                              }
                            >
                              {
                                validation.group
                              }{" "}
                              ·{" "}
                              {
                                validation.time
                              }
                            </Text>
                          </View>

                          <View
                            style={
                              styles.pendingBadge
                            }
                          >
                            <View
                              style={
                                styles.pendingDot
                              }
                            />

                            <Text
                              style={
                                styles.pendingBadgeText
                              }
                            >
                              Pendente
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={
                            styles.validationTaskTitle
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

                      <View
                        style={
                          styles.validationActions
                        }
                      >
                        <TouchableOpacity
                          activeOpacity={
                            0.85
                          }
                          style={
                            styles.contestButton
                          }
                          onPress={() =>
                            setValidationToContest(
                              validation,
                            )
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
                              styles.contestButtonText
                            }
                          >
                            Contestar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={
                            0.85
                          }
                          style={
                            styles.approveButton
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#FFFFFF"
                          />

                          <Text
                            style={
                              styles.approveButtonText
                            }
                          >
                            Aprovar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                },
              )
            )}
          </>
        )}
      </ScrollView>

      {/* AJUDA */}

      <Modal
        visible={showHelp}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowHelp(false)
        }
      >
        <View
          style={
            styles.helpOverlay
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={
              styles.overlayBackground
            }
            onPress={() =>
              setShowHelp(false)
            }
          />

          <View
            style={
              styles.helpModal
            }
          >
            <View
              style={
                styles.helpModalHeader
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.helpTitle
                  }
                >
                  Como funciona?
                </Text>

                <Text
                  style={
                    styles.helpSubtitle
                  }
                >
                  Do desafio até a
                  pontuação.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.helpCloseButton
                }
                onPress={() =>
                  setShowHelp(false)
                }
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={
                    theme.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.helpSteps
              }
            >
              <HelpStep
                number="1"
                icon="flag-outline"
                title="Receba um objetivo"
                description="Administradores criam desafios para os membros do grupo."
                color={
                  theme.primary
                }
              />

              <HelpStep
                number="2"
                icon="camera-outline"
                title="Envie uma evidência"
                description="Ao cumprir a missão, envie uma foto que comprove a realização."
                color={
                  UI.purpleBright
                }
              />

              <HelpStep
                number="3"
                icon="shield-checkmark-outline"
                title="O grupo valida"
                description="Outros membros podem aprovar ou contestar a sua evidência."
                color={
                  theme.success
                }
              />

              <HelpStep
                number="4"
                icon="people-outline"
                title="Contestou? Tem votação"
                description="Em caso de contestação, os membros elegíveis ajudam a decidir o resultado."
                color={
                  UI.purpleSoft
                }
                last
              />
            </View>

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={
                styles.helpGotItButton
              }
              onPress={() =>
                setShowHelp(false)
              }
            >
              <Text
                style={
                  styles.helpGotItText
                }
              >
                Entendi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DETALHES DO OBJETIVO */}

      <Modal
        visible={
          !!selectedTask
        }
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() =>
          setSelectedTask(null)
        }
      >
        <SafeAreaView
          style={
            styles.modalContainer
          }
          edges={[
            "top",
            "left",
            "right",
          ]}
        >
          <View
            style={
              styles.modalHeader
            }
          >
            <View>
              <Text
                style={
                  styles.modalHeaderLabel
                }
              >
                OBJETIVO
              </Text>

              <Text
                style={
                  styles.modalHeaderTitle
                }
              >
                Detalhes
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={
                styles.closeButton
              }
              onPress={() =>
                setSelectedTask(
                  null,
                )
              }
            >
              <Ionicons
                name="close"
                size={21}
                color={
                  theme.textPrimary
                }
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.modalContent
            }
          >
            {selectedTask && (
              <>
                <LinearGradient
                  colors={[
                    "#322065",
                    "#202B55",
                    "#181E34",
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.modalHero
                  }
                >
                  <View
                    style={
                      styles.modalHeroIcon
                    }
                  >
                    <Ionicons
                      name="flag"
                      size={25}
                      color="#DDD5FF"
                    />
                  </View>

                  <Text
                    style={
                      styles.modalGroup
                    }
                  >
                    {getTaskGroupName(
                      selectedTask.group,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.modalTaskTitle
                    }
                  >
                    {
                      selectedTask.title
                    }
                  </Text>

                  <View
                    style={
                      styles.modalPoints
                    }
                  >
                    <Ionicons
                      name="sparkles"
                      size={14}
                      color="#D6CCFF"
                    />

                    <Text
                      style={
                        styles.modalPointsText
                      }
                    >
                      {
                        selectedTask.points
                      }{" "}
                      pontos
                    </Text>
                  </View>
                </LinearGradient>

                {selectedTask.description?.trim() && (
                  <>
                    <Text
                      style={
                        styles.modalSectionTitle
                      }
                    >
                      Sobre o desafio
                    </Text>

                    <View
                      style={
                        styles.descriptionCard
                      }
                    >
                      <Text
                        style={
                          styles.modalDescription
                        }
                      >
                        {
                          selectedTask.description
                        }
                      </Text>
                    </View>
                  </>
                )}

                <Text
                  style={
                    styles.modalSectionTitle
                  }
                >
                  Período
                </Text>

                <View
                  style={
                    styles.periodCard
                  }
                >
                  <View
                    style={
                      styles.periodItem
                    }
                  >
                    <View
                      style={
                        styles.periodIconBlue
                      }
                    >
                      <Ionicons
                        name="play"
                        size={13}
                        color={
                          theme.primary
                        }
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.periodLabel
                        }
                      >
                        INÍCIO
                      </Text>

                      <Text
                        style={
                          styles.periodValue
                        }
                      >
                        {formatDateTime(
                          selectedTask.startsAt,
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.periodSeparator
                    }
                  />

                  <View
                    style={
                      styles.periodItem
                    }
                  >
                    <View
                      style={
                        styles.periodIconPurple
                      }
                    >
                      <Ionicons
                        name="flag"
                        size={13}
                        color={
                          UI.purpleBright
                        }
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.periodLabel
                        }
                      >
                        PRAZO FINAL
                      </Text>

                      <Text
                        style={
                          styles.periodValue
                        }
                      >
                        {formatDateTime(
                          selectedTask.deadline,
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={
                    styles.modalSectionTitle
                  }
                >
                  Evidência
                </Text>

                <View
                  style={
                    styles.uploadCard
                  }
                >
                  <LinearGradient
                    colors={[
                      "#29356B",
                      "#3A236E",
                    ]}
                    style={
                      styles.uploadIcon
                    }
                  >
                    <Ionicons
                      name="camera-outline"
                      size={27}
                      color="#D3C8FF"
                    />
                  </LinearGradient>

                  <Text
                    style={
                      styles.uploadTitle
                    }
                  >
                    Comprove seu objetivo
                  </Text>

                  <Text
                    style={
                      styles.uploadDescription
                    }
                  >
                    Envie uma foto que
                    demonstre a
                    realização deste
                    objetivo.
                  </Text>

                  <TouchableOpacity
                    disabled
                    style={
                      styles.uploadButtonDisabled
                    }
                  >
                    <Ionicons
                      name="camera-outline"
                      size={18}
                      color={
                        theme.textSecondary
                      }
                    />

                    <Text
                      style={
                        styles.uploadButtonDisabledText
                      }
                    >
                      Selecionar foto
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={
                      styles.integrationNotice
                    }
                  >
                    Integração de
                    evidências na próxima
                    etapa
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* CONTESTAÇÃO */}

      <Modal
        visible={
          !!validationToContest
        }
        animationType="fade"
        transparent
        onRequestClose={
          closeContestModal
        }
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : "height"
          }
          style={
            styles.overlay
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={
              styles.overlayBackground
            }
            onPress={
              closeContestModal
            }
          />

          <View
            style={
              styles.contestModal
            }
          >
            <View
              style={
                styles.contestModalIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color={
                  theme.error
                }
              />
            </View>

            <Text
              style={
                styles.contestModalTitle
              }
            >
              Contestar evidência
            </Text>

            <Text
              style={
                styles.contestModalSubtitle
              }
            >
              Explique o que está
              errado. Se a contestação
              for aberta, o grupo
              poderá participar da
              decisão.
            </Text>

            <TextInput
              value={
                contestReason
              }
              onChangeText={
                setContestReason
              }
              multiline
              autoFocus
              maxLength={300}
              textAlignVertical="top"
              placeholder="Ex: A foto não comprova que o objetivo foi realizado..."
              placeholderTextColor="#5E687B"
              style={
                styles.contestInput
              }
            />

            <Text
              style={
                styles.characterCount
              }
            >
              {
                contestReason.length
              }
              /300
            </Text>

            <View
              style={
                styles.contestModalActions
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  closeContestModal
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={
                  !contestReason.trim()
                }
                style={[
                  styles.confirmContestButton,

                  !contestReason.trim() &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleContest
                }
              >
                <Text
                  style={
                    styles.confirmContestText
                  }
                >
                  Contestar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

type HelpStepProps = {
  number: string;

  icon:
    React.ComponentProps<
      typeof Ionicons
    >["name"];

  title: string;
  description: string;
  color: string;
  last?: boolean;
};

function HelpStep({
  number,
  icon,
  title,
  description,
  color,
  last = false,
}: HelpStepProps) {
  return (
    <View
      style={
        styles.helpStep
      }
    >
      <View
        style={
          styles.helpStepTimeline
        }
      >
        <View
          style={[
            styles.helpStepCircle,
            {
              borderColor: color,
            },
          ]}
        >
          <Text
            style={[
              styles.helpStepNumber,
              {
                color,
              },
            ]}
          >
            {number}
          </Text>
        </View>

        {!last && (
          <View
            style={
              styles.helpStepLine
            }
          />
        )}
      </View>

      <View
        style={
          styles.helpStepContent
        }
      >
        <View
          style={
            styles.helpStepTitleRow
          }
        >
          <Ionicons
            name={icon}
            size={17}
            color={color}
          />

          <Text
            style={
              styles.helpStepTitle
            }
          >
            {title}
          </Text>
        </View>

        <Text
          style={
            styles.helpStepDescription
          }
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        theme.background,
    },

    scrollContent: {
      paddingBottom: 125,
    },

    /*
     * HEADER
     */

    header: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 20,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerTitleArea: {
      flex: 1,
    },

    title: {
      color:
        theme.textPrimary,

      fontSize: 34,
      fontWeight: "800",

      letterSpacing: -1,
    },

    subtitle: {
      color:
        theme.textSecondary,

      fontSize: 14,
      lineHeight: 20,

      marginTop: 5,
    },

    helpButton: {
      width: 48,
      height: 48,

      borderRadius: 16,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#151D2E",

      borderWidth: 1,
      borderColor: "#29344B",
    },

    /*
     * TABS
     */

    segmentContainer: {
      marginHorizontal: 20,

      padding: 4,

      height: 58,

      flexDirection: "row",

      borderRadius: 18,

      backgroundColor:
        "#12192A",

      borderWidth: 1,
      borderColor: "#202A40",
    },

    segmentButton: {
      flex: 1,

      borderRadius: 14,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 8,
    },

    segmentButtonActive: {
      backgroundColor:
        UI.purpleSurfaceStrong,

      borderWidth: 1,

      borderColor:
        UI.purple,
    },

    segmentText: {
      color:
        theme.textSecondary,

      fontSize: 14,
      fontWeight: "700",
    },

    segmentTextActive: {
      color: "#FFFFFF",
    },

    segmentBadge: {
      minWidth: 22,
      height: 22,

      paddingHorizontal: 6,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#5E6BFF",
    },

    segmentBadgeText: {
      color: "#FFFFFF",

      fontSize: 10,
      fontWeight: "900",
    },

    /*
     * PROGRESSO
     */

    progressCard: {
      marginHorizontal: 20,
      marginTop: 18,

      padding: 18,

      borderRadius: 22,

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.34)",
    },

    progressTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    progressSymbol: {
      width: 52,
      height: 52,

      borderRadius: 17,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(122,90,248,0.22)",

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.35)",
    },

    progressTitleArea: {
      flex: 1,

      marginLeft: 12,
    },

    progressLabel: {
      color: "#A998FF",

      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 1.4,
    },

    progressTitle: {
      color: "#FFFFFF",

      fontSize: 18,

      fontWeight: "800",

      marginTop: 3,
    },

    progressDescription: {
      color: "#B0B8CB",

      fontSize: 13,

      lineHeight: 20,

      marginTop: 15,
    },

    progressStats: {
      flexDirection: "row",

      marginTop: 17,
      paddingTop: 15,

      borderTopWidth: 1,

      borderTopColor:
        "rgba(255,255,255,0.09)",
    },

    progressStat: {
      flex: 1,
    },

    progressDivider: {
      width: 1,

      marginHorizontal: 18,

      backgroundColor:
        "rgba(255,255,255,0.10)",
    },

    progressStatValue: {
      color: "#C6D0FF",

      fontSize: 26,

      fontWeight: "900",
    },

    progressStatValuePurple: {
      color:
        UI.purpleSoft,

      fontSize: 26,

      fontWeight: "900",
    },

    progressStatLabel: {
      color: "#939DB2",

      fontSize: 11,

      marginTop: 3,
    },

    /*
     * SUMMARY VALIDATION
     */

    validationSummary: {
      marginHorizontal: 20,
      marginTop: 18,

      padding: 16,

      borderRadius: 19,

      flexDirection: "row",
      alignItems: "center",

      gap: 12,

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.28)",
    },

    validationSummaryIcon: {
      width: 46,
      height: 46,

      borderRadius: 15,

      backgroundColor:
        "rgba(139,108,255,0.18)",

      alignItems: "center",
      justifyContent: "center",
    },

    validationSummaryTitle: {
      color:
        theme.textPrimary,

      fontSize: 15,

      fontWeight: "800",
    },

    validationSummaryText: {
      color:
        theme.textSecondary,

      fontSize: 10,

      marginTop: 3,
    },

    /*
     * FILTROS
     */

    filterSection: {
      marginTop: 20,
    },

    filterHeader: {
      paddingHorizontal: 20,

      marginBottom: 9,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    filterHeaderLeft: {
      flexDirection: "row",

      alignItems: "center",

      gap: 6,
    },

    filterLabel: {
      color:
        theme.textSecondary,

      fontSize: 10,

      fontWeight: "700",

      textTransform:
        "uppercase",

      letterSpacing: 0.6,
    },

    clearFilter: {
      color:
        UI.purpleBright,

      fontSize: 10,

      fontWeight: "800",
    },

    filtersContainer: {
      paddingHorizontal: 20,

      gap: 8,
    },

    filterChip: {
      height: 35,

      paddingHorizontal: 14,

      borderRadius: 18,

      flexDirection: "row",
      alignItems: "center",

      gap: 6,

      backgroundColor:
        UI.softSurface,

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    filterChipActive: {
      backgroundColor:
        UI.purpleSurfaceStrong,

      borderColor:
        UI.purple,
    },

    filterActiveDot: {
      width: 6,
      height: 6,

      borderRadius: 3,

      backgroundColor:
        UI.purpleBright,
    },

    filterText: {
      color:
        theme.textSecondary,

      fontSize: 11,

      fontWeight: "600",
    },

    filterTextActive: {
      color: "#FFFFFF",

      fontWeight: "800",
    },

    /*
     * SECTION
     */

    sectionHeader: {
      marginHorizontal: 20,

      marginTop: 26,
      marginBottom: 13,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    sectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 19,

      fontWeight: "800",
    },

    sectionSubtitle: {
      color: "#7D879C",

      fontSize: 11,

      marginTop: 4,
    },

    sectionCounter: {
      minWidth: 31,
      height: 31,

      paddingHorizontal: 8,

      borderRadius: 10,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.purpleSurface,
    },

    sectionCounterText: {
      color:
        UI.purpleSoft,

      fontSize: 12,

      fontWeight: "900",
    },

    /*
     * TASK CARD
     */

    taskCard: {
      marginHorizontal: 20,
      marginBottom: 11,

      padding: 14,

      flexDirection: "row",

      backgroundColor:
        theme.surface,

      borderRadius: 18,

      borderWidth: 1,

      borderColor: "#253047",
    },

    taskIcon: {
      width: 47,
      height: 47,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      marginRight: 12,
    },

    taskMain: {
      flex: 1,
    },

    taskMetaTop: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: 8,
    },

    taskGroup: {
      flex: 1,

      color:
        theme.primary,

      fontSize: 10,

      fontWeight: "800",
    },

    pointsBadge: {
      minWidth: 40,
      height: 26,

      paddingHorizontal: 8,

      borderRadius: 9,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 3,

      backgroundColor:
        UI.purpleSurface,
    },

    pointsText: {
      color:
        UI.purpleSoft,

      fontSize: 10,

      fontWeight: "900",
    },

    taskTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,

      lineHeight: 22,

      fontWeight: "800",

      marginTop: 5,
    },

    taskDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 17,

      marginTop: 4,
    },

    taskFooter: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginTop: 12,
    },

    deadlineArea: {
      flexDirection: "row",

      alignItems: "center",

      gap: 5,
    },

    deadlineText: {
      color:
        theme.textSecondary,

      fontSize: 10,
    },

    cardArrow: {
      width: 27,
      height: 27,

      borderRadius: 9,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#20283A",
    },

    /*
     * STATES
     */

    simpleState: {
      minHeight: 230,

      paddingHorizontal: 35,

      alignItems: "center",
      justifyContent: "center",
    },

    emptyState: {
      minHeight: 285,

      paddingHorizontal: 32,

      alignItems: "center",
      justifyContent: "center",
    },

    emptyDecoration: {
      width: 112,
      height: 112,

      alignItems: "center",
      justifyContent: "center",

      marginBottom: 8,
    },

    emptyRingOuter: {
      position: "absolute",

      width: 108,
      height: 108,

      borderRadius: 54,

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.16)",
    },

    emptyRingInner: {
      position: "absolute",

      width: 86,
      height: 86,

      borderRadius: 43,

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.23)",
    },

    emptyIcon: {
      width: 63,
      height: 63,

      borderRadius: 21,

      alignItems: "center",
      justifyContent: "center",

      shadowColor:
        UI.purple,

      shadowOpacity: 0.24,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 4,
    },

    successIcon: {
      width: 60,
      height: 60,

      borderRadius: 20,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(34,197,94,0.09)",

      marginBottom: 14,
    },

    errorIcon: {
      width: 60,
      height: 60,

      borderRadius: 20,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.08)",

      marginBottom: 14,
    },

    stateTitle: {
      color:
        theme.textPrimary,

      fontSize: 17,

      fontWeight: "800",

      textAlign: "center",
    },

    stateDescription: {
      color:
        theme.textSecondary,

      fontSize: 12,

      lineHeight: 19,

      textAlign: "center",

      maxWidth: 275,

      marginTop: 7,
    },

    emptyHint: {
      marginTop: 18,

      minHeight: 38,

      paddingHorizontal: 15,

      borderRadius: 13,

      backgroundColor:
        UI.purpleSurface,

      flexDirection: "row",

      alignItems: "center",

      gap: 7,

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.22)",
    },

    emptyHintText: {
      color: "#C3B7F5",

      fontSize: 11,

      fontWeight: "700",
    },

    retryButton: {
      height: 42,

      marginTop: 17,

      paddingHorizontal: 15,

      borderRadius: 12,

      backgroundColor:
        theme.primary,

      flexDirection: "row",

      alignItems: "center",

      gap: 7,
    },

    retryText: {
      color: "#FFFFFF",

      fontSize: 12,

      fontWeight: "700",
    },

    /*
     * VALIDAÇÃO
     */

    validationCard: {
      marginHorizontal: 20,
      marginBottom: 15,

      backgroundColor:
        theme.surface,

      borderRadius: 18,

      overflow: "hidden",

      borderWidth: 1,

      borderColor: "#253047",
    },

    validationHeader: {
      padding: 15,
    },

    validationUserRow: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 11,
    },

    avatar: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.blueSurface,

      marginRight: 10,
    },

    avatarText: {
      color: "#92A8FF",

      fontSize: 11,

      fontWeight: "900",
    },

    validationUserName: {
      color:
        theme.textPrimary,

      fontSize: 13,

      fontWeight: "800",
    },

    validationMeta: {
      color:
        theme.textSecondary,

      fontSize: 10,

      marginTop: 2,
    },

    pendingBadge: {
      height: 24,

      paddingHorizontal: 8,

      borderRadius: 8,

      backgroundColor:
        "rgba(245,158,11,0.09)",

      flexDirection: "row",

      alignItems: "center",

      gap: 5,
    },

    pendingDot: {
      width: 5,
      height: 5,

      borderRadius: 3,

      backgroundColor:
        theme.warning,
    },

    pendingBadgeText: {
      color:
        theme.warning,

      fontSize: 9,

      fontWeight: "800",
    },

    validationTaskTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,

      lineHeight: 22,

      fontWeight: "800",
    },

    evidenceImage: {
      width: "100%",

      height: 205,

      backgroundColor:
        "#111827",
    },

    validationActions: {
      flexDirection: "row",

      padding: 11,

      gap: 9,
    },

    contestButton: {
      flex: 1,

      height: 43,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 6,

      backgroundColor:
        "rgba(239,68,68,0.065)",
    },

    contestButtonText: {
      color:
        theme.error,

      fontSize: 11,

      fontWeight: "800",
    },

    approveButton: {
      flex: 1,

      height: 43,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 6,

      backgroundColor:
        theme.primary,
    },

    approveButtonText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "800",
    },

    /*
     * VOTAÇÃO
     */

    votingCard: {
      marginHorizontal: 20,
      marginBottom: 18,

      borderRadius: 20,

      overflow: "hidden",

      backgroundColor:
        "#181329",

      borderWidth: 1,

      borderColor:
        UI.purpleBorder,

      shadowColor:
        UI.purple,

      shadowOpacity: 0.22,

      shadowRadius: 16,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 5,
    },

    votingBanner: {
      minHeight: 69,

      paddingHorizontal: 14,

      flexDirection: "row",

      alignItems: "center",

      gap: 10,

      borderBottomWidth: 1,

      borderBottomColor:
        "rgba(205,190,255,0.18)",
    },

    votingBannerIcon: {
      width: 39,
      height: 39,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(255,255,255,0.09)",
    },

    votingBannerTitle: {
      color: "#EEE9FF",

      fontSize: 10,

      fontWeight: "900",

      letterSpacing: 0.8,
    },

    votingBannerSubtitle: {
      color: "#B6A9D2",

      fontSize: 9,

      marginTop: 2,
    },

    liveBadge: {
      height: 26,

      paddingHorizontal: 8,

      borderRadius: 8,

      flexDirection: "row",

      alignItems: "center",

      gap: 5,

      backgroundColor:
        "rgba(167,139,250,0.18)",

      borderWidth: 1,

      borderColor:
        "rgba(196,181,253,0.15)",
    },

    liveDot: {
      width: 6,
      height: 6,

      borderRadius: 3,

      backgroundColor:
        "#B79CFF",
    },

    liveText: {
      color: "#DDD0FF",

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 0.5,
    },

    votingAvatar: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#39235D",

      marginRight: 10,
    },

    votingAvatarText: {
      color: "#D5C7FF",

      fontSize: 11,

      fontWeight: "900",
    },

    votingImage: {
      width: "100%",

      height: 210,

      backgroundColor:
        "#120F1D",
    },

    votingReason: {
      marginHorizontal: 13,
      marginTop: 13,

      padding: 13,

      borderRadius: 13,

      backgroundColor:
        "#251842",

      borderWidth: 1,

      borderColor:
        "#493174",
    },

    votingReasonTitleRow: {
      flexDirection: "row",

      alignItems: "center",

      gap: 6,

      marginBottom: 7,
    },

    votingReasonTitle: {
      color:
        UI.purpleSoft,

      fontSize: 10,

      fontWeight: "900",
    },

    votingReasonText: {
      color: "#C0B7D0",

      fontSize: 11,

      lineHeight: 17,
    },

    votingReasonAuthor: {
      color: "#FFFFFF",

      fontWeight: "800",
    },

    voteDecision: {
      paddingHorizontal: 15,
      paddingTop: 16,

      alignItems: "center",
    },

    voteQuestion: {
      color: "#F4F0FF",

      fontSize: 13,

      fontWeight: "800",
    },

    voteHint: {
      color: "#9185A3",

      fontSize: 9,

      marginTop: 3,

      textAlign: "center",
    },

    votingActions: {
      flexDirection: "row",

      padding: 13,

      gap: 9,
    },

    invalidateButton: {
      flex: 1,

      height: 44,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 6,

      backgroundColor:
        "rgba(239,68,68,0.07)",

      borderWidth: 1,

      borderColor:
        "rgba(239,68,68,0.16)",
    },

    invalidateText: {
      color:
        theme.error,

      fontSize: 11,

      fontWeight: "800",
    },

    keepValidButton: {
      flex: 1.2,

      height: 44,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 6,

      backgroundColor:
        UI.purpleBright,
    },

    keepValidText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "900",
    },

    /*
     * HELP
     */

    helpOverlay: {
      flex: 1,

      justifyContent: "center",

      paddingHorizontal: 20,

      backgroundColor:
        "rgba(5,8,15,0.87)",
    },

    helpModal: {
      zIndex: 2,

      padding: 20,

      borderRadius: 22,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor: "#303C54",
    },

    helpModalHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    helpTitle: {
      color:
        theme.textPrimary,

      fontSize: 20,

      fontWeight: "800",
    },

    helpSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 11,

      marginTop: 3,
    },

    helpCloseButton: {
      width: 36,
      height: 36,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        theme.background,
    },

    helpSteps: {
      marginTop: 22,
      marginBottom: 5,
    },

    helpStep: {
      flexDirection: "row",

      minHeight: 69,
    },

    helpStepTimeline: {
      width: 31,

      alignItems: "center",
    },

    helpStepCircle: {
      width: 26,
      height: 26,

      borderRadius: 13,

      borderWidth: 1,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        theme.background,
    },

    helpStepNumber: {
      fontSize: 9,

      fontWeight: "900",
    },

    helpStepLine: {
      width: 1,

      flex: 1,

      marginVertical: 4,

      backgroundColor:
        theme.border,
    },

    helpStepContent: {
      flex: 1,

      paddingLeft: 10,
      paddingBottom: 14,
    },

    helpStepTitleRow: {
      flexDirection: "row",

      alignItems: "center",

      gap: 6,
    },

    helpStepTitle: {
      color:
        theme.textPrimary,

      fontSize: 12,

      fontWeight: "800",
    },

    helpStepDescription: {
      color:
        theme.textSecondary,

      fontSize: 10,

      lineHeight: 16,

      marginTop: 4,
    },

    helpGotItButton: {
      height: 46,

      marginTop: 6,

      borderRadius: 12,

      backgroundColor:
        UI.purpleBright,

      alignItems: "center",
      justifyContent: "center",
    },

    helpGotItText: {
      color: "#FFFFFF",

      fontSize: 12,

      fontWeight: "800",
    },

    /*
     * MODAL OBJETIVO
     */

    modalContainer: {
      flex: 1,

      backgroundColor:
        theme.background,
    },

    modalHeader: {
      minHeight: 66,

      paddingHorizontal: 20,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    modalHeaderLabel: {
      color:
        UI.purpleBright,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 1.1,
    },

    modalHeaderTitle: {
      color:
        theme.textPrimary,

      fontSize: 19,

      fontWeight: "800",

      marginTop: 2,
    },

    closeButton: {
      width: 38,
      height: 38,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        theme.surface,
    },

    modalContent: {
      paddingHorizontal: 20,
      paddingBottom: 50,
    },

    modalHero: {
      paddingVertical: 25,
      paddingHorizontal: 20,

      borderRadius: 21,

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.28)",
    },

    modalHeroIcon: {
      width: 56,
      height: 56,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.18)",

      marginBottom: 11,
    },

    modalGroup: {
      color: "#9EB0FF",

      fontSize: 10,

      fontWeight: "800",

      marginBottom: 6,
    },

    modalTaskTitle: {
      color:
        theme.textPrimary,

      fontSize: 23,

      lineHeight: 29,

      fontWeight: "900",

      maxWidth: 300,

      textAlign: "center",
    },

    modalPoints: {
      marginTop: 13,

      height: 30,

      paddingHorizontal: 10,

      borderRadius: 9,

      flexDirection: "row",

      alignItems: "center",

      gap: 5,

      backgroundColor:
        "rgba(139,108,255,0.17)",
    },

    modalPointsText: {
      color: "#DDD5FF",

      fontSize: 10,

      fontWeight: "900",
    },

    modalSectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 15,

      fontWeight: "800",

      marginTop: 25,
      marginBottom: 9,
    },

    descriptionCard: {
      padding: 15,

      borderRadius: 14,

      backgroundColor:
        theme.surface,
    },

    modalDescription: {
      color:
        theme.textSecondary,

      fontSize: 12,

      lineHeight: 20,
    },

    periodCard: {
      paddingHorizontal: 15,

      borderRadius: 15,

      backgroundColor:
        theme.surface,
    },

    periodItem: {
      minHeight: 65,

      flexDirection: "row",

      alignItems: "center",

      gap: 11,
    },

    periodSeparator: {
      height: 1,

      marginLeft: 43,

      backgroundColor:
        theme.border,
    },

    periodIconBlue: {
      width: 32,
      height: 32,

      borderRadius: 10,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(82,114,242,0.12)",
    },

    periodIconPurple: {
      width: 32,
      height: 32,

      borderRadius: 10,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.14)",
    },

    periodLabel: {
      color:
        theme.textSecondary,

      fontSize: 8,

      fontWeight: "700",

      letterSpacing: 0.5,
    },

    periodValue: {
      color:
        theme.textPrimary,

      fontSize: 11,

      fontWeight: "700",

      marginTop: 3,
    },

    uploadCard: {
      padding: 21,

      borderRadius: 18,

      alignItems: "center",

      backgroundColor:
        theme.surface,
    },

    uploadIcon: {
      width: 54,
      height: 54,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",
    },

    uploadTitle: {
      color:
        theme.textPrimary,

      fontSize: 14,

      fontWeight: "800",

      marginTop: 11,
    },

    uploadDescription: {
      color:
        theme.textSecondary,

      fontSize: 10,

      lineHeight: 17,

      maxWidth: 255,

      textAlign: "center",

      marginTop: 5,
    },

    uploadButtonDisabled: {
      width: "100%",
      height: 44,

      marginTop: 16,

      borderRadius: 11,

      backgroundColor:
        "#20283A",

      opacity: 0.65,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 6,
    },

    uploadButtonDisabledText: {
      color:
        theme.textSecondary,

      fontSize: 11,

      fontWeight: "800",
    },

    integrationNotice: {
      color: "#59657A",

      fontSize: 8,

      marginTop: 8,
    },

    /*
     * CONTESTAÇÃO
     */

    overlay: {
      flex: 1,

      justifyContent: "center",

      paddingHorizontal: 20,

      backgroundColor:
        "rgba(4,7,14,0.85)",
    },

    overlayBackground: {
      ...StyleSheet.absoluteFillObject,
    },

    contestModal: {
      zIndex: 2,

      padding: 20,

      borderRadius: 20,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    contestModalIcon: {
      width: 46,
      height: 46,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.08)",

      marginBottom: 13,
    },

    contestModalTitle: {
      color:
        theme.textPrimary,

      fontSize: 18,

      fontWeight: "800",
    },

    contestModalSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 18,

      marginTop: 6,
      marginBottom: 15,
    },

    contestInput: {
      minHeight: 110,

      padding: 13,

      borderRadius: 12,

      color:
        theme.textPrimary,

      fontSize: 11,

      lineHeight: 18,

      backgroundColor:
        theme.background,

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    characterCount: {
      color: "#586274",

      fontSize: 9,

      textAlign: "right",

      marginTop: 6,
    },

    contestModalActions: {
      flexDirection: "row",

      gap: 9,

      marginTop: 15,
    },

    cancelButton: {
      flex: 1,

      height: 44,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        theme.background,
    },

    cancelButtonText: {
      color:
        theme.textPrimary,

      fontSize: 11,

      fontWeight: "800",
    },

    confirmContestButton: {
      flex: 1,

      height: 44,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        theme.error,
    },

    disabledButton: {
      opacity: 0.35,
    },

    confirmContestText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "800",
    },
  });