import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
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

  surfaceSoft: "#151C2B",
  surfaceRaised: "#1B2335",

  borderSoft: "#283249",
  muted: "#717C91",
};

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

function formatHistoryDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function HistoricoObjetivosScreen() {
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
    historyTasks,
    setHistoryTasks,
  ] = useState<Task[]>([]);

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState("todos");

  const [
    selectedTask,
    setSelectedTask,
  ] =
    useState<Task | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const carregarHistorico =
    useCallback(
      async (
        refreshing = false,
      ) => {
        if (!token) {
          setHistoryTasks([]);
          setIsLoading(false);
          return;
        }

        try {
          if (refreshing) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }

          setError("");

          const response =
            await taskService.getTaskHistory(
              token,
            );

          setHistoryTasks(
            response.tasks,
          );
        } catch (error) {
          console.error(
            "Erro ao carregar histórico de objetivos:",
            error,
          );

          if (
            error instanceof ApiError
          ) {
            setError(
              error.message,
            );
          } else {
            setError(
              "Não foi possível carregar o histórico de objetivos.",
            );
          }
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [token],
    );

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico]),
  );

  const taskFilters =
    useMemo(() => {
      const groups =
        new Map<
          string,
          string
        >();

      historyTasks.forEach(
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
          ([value, label]) => ({
            value,
            label,
          }),
        ),
      ];
    }, [historyTasks]);

  useFocusEffect(
    useCallback(() => {
      if (
        !requestedGroupId ||
        historyTasks.length === 0
      ) {
        return;
      }

      const hasGroup =
        historyTasks.some(
          (task) =>
            getTaskGroupId(
              task.group,
            ) === requestedGroupId,
        );

      if (hasGroup) {
        setSelectedFilter(
          requestedGroupId,
        );
      }
    }, [
      requestedGroupId,
      historyTasks,
    ]),
  );

  const filteredTasks =
    useMemo(() => {
      const tasks =
        selectedFilter === "todos"
          ? historyTasks
          : historyTasks.filter(
              (task) =>
                getTaskGroupId(
                  task.group,
                ) ===
                selectedFilter,
            );

      return [...tasks].sort(
        (a, b) =>
          new Date(
            b.deadline,
          ).getTime() -
          new Date(
            a.deadline,
          ).getTime(),
      );
    }, [
      historyTasks,
      selectedFilter,
    ]);

  const shouldShowFilters =
    taskFilters.length > 2;

  const totalPoints =
    useMemo(() => {
      return filteredTasks.reduce(
        (total, task) =>
          total + task.points,
        0,
      );
    }, [filteredTasks]);

  function voltar() {
    router.back();
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
          <RefreshControl
            refreshing={
              isRefreshing
            }
            onRefresh={() =>
              carregarHistorico(
                true,
              )
            }
            tintColor={
              UI.purpleBright
            }
            colors={[
              UI.purpleBright,
            ]}
          />
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.backButton
            }
            onPress={voltar}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={
                theme.textPrimary
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerContent
            }
          >
            <Text
              style={
                styles.headerLabel
              }
            >
              OBJETIVOS
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Histórico
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Relembre desafios que já
              chegaram ao fim.
            </Text>
          </View>
        </View>

        {/* RESUMO */}

        {!isLoading &&
          !error && (
            <LinearGradient
              colors={[
                "#1A2238",
                "#261C4C",
                "#181D30",
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
                styles.summaryCard
              }
            >
              <View
                style={
                  styles.summaryTop
                }
              >
                <View
                  style={
                    styles.summaryIcon
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color="#CEC4FF"
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    SUA JORNADA
                  </Text>

                  <Text
                    style={
                      styles.summaryTitle
                    }
                  >
                    Missões concluídas no
                    tempo
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.summaryDescription
                }
              >
                Aqui ficam os objetivos
                cujo prazo já terminou.
              </Text>

              <View
                style={
                  styles.summaryStats
                }
              >
                <View
                  style={
                    styles.summaryStat
                  }
                >
                  <Text
                    style={
                      styles.summaryStatValue
                    }
                  >
                    {
                      filteredTasks.length
                    }
                  </Text>

                  <Text
                    style={
                      styles.summaryStatLabel
                    }
                  >
                    objetivos encerrados
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryDivider
                  }
                />

                <View
                  style={
                    styles.summaryStat
                  }
                >
                  <Text
                    style={
                      styles.summaryStatValuePurple
                    }
                  >
                    {totalPoints}
                  </Text>

                  <Text
                    style={
                      styles.summaryStatLabel
                    }
                  >
                    pontos envolvidos
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

        {/* FILTROS */}

        {shouldShowFilters &&
          !isLoading &&
          !error && (
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
                {taskFilters.map(
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
                          {
                            filter.label
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>
            </View>
          )}

        {/* CONTEÚDO */}

        {isLoading ? (
          <View
            style={
              styles.stateContainer
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
              Carregando histórico
            </Text>

            <Text
              style={
                styles.stateDescription
              }
            >
              Buscando seus objetivos
              anteriores.
            </Text>
          </View>
        ) : error ? (
          <View
            style={
              styles.stateContainer
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <Ionicons
                name="cloud-offline-outline"
                size={27}
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
              Não conseguimos carregar
            </Text>

            <Text
              style={
                styles.stateDescription
              }
            >
              {error}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.retryButton
              }
              onPress={() =>
                carregarHistorico()
              }
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.retryButtonText
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
                  styles.emptyRing
                }
              />

              <LinearGradient
                colors={[
                  "#35255F",
                  "#26365D",
                ]}
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="time-outline"
                  size={29}
                  color="#D4CAFF"
                />
              </LinearGradient>
            </View>

            <Text
              style={
                styles.stateTitle
              }
            >
              Nenhum objetivo encerrado
            </Text>

            <Text
              style={
                styles.stateDescription
              }
            >
              Quando o prazo de um objetivo
              terminar, ele aparecerá aqui.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Objetivos anteriores
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Do mais recente para o
                  mais antigo
                </Text>
              </View>

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
            </View>

            {filteredTasks.map(
              (task) => (
                <TouchableOpacity
                  key={task._id}
                  activeOpacity={0.86}
                  style={
                    styles.historyCard
                  }
                  onPress={() =>
                    setSelectedTask(
                      task,
                    )
                  }
                >
                  <View
                    style={
                      styles.historyCardIcon
                    }
                  >
                    <Ionicons
                      name="checkmark-done-outline"
                      size={19}
                      color={
                        UI.purpleSoft
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.historyCardContent
                    }
                  >
                    <View
                      style={
                        styles.historyCardTop
                      }
                    >
                      <Text
                        style={
                          styles.historyGroup
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
                          styles.endedBadge
                        }
                      >
                        <Text
                          style={
                            styles.endedBadgeText
                          }
                        >
                          ENCERRADO
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.historyTaskTitle
                      }
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>

                    <View
                      style={
                        styles.historyFooter
                      }
                    >
                      <View
                        style={
                          styles.historyDateArea
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={13}
                          color={
                            theme.textSecondary
                          }
                        />

                        <Text
                          style={
                            styles.historyDateText
                          }
                        >
                          Finalizado em{" "}
                          {formatHistoryDate(
                            task.deadline,
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.historyPoints
                        }
                      >
                        <Ionicons
                          name="sparkles"
                          size={11}
                          color={
                            UI.purpleSoft
                          }
                        />

                        <Text
                          style={
                            styles.historyPointsText
                          }
                        >
                          {
                            task.points
                          }
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#68748A"
                  />
                </TouchableOpacity>
              ),
            )}
          </>
        )}
      </ScrollView>

      {/* DETALHES */}

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
                HISTÓRICO
              </Text>

              <Text
                style={
                  styles.modalHeaderTitle
                }
              >
                Objetivo encerrado
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
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
                    "#2A2148",
                    "#202A48",
                    "#181D2E",
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
                      name="time-outline"
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
                      styles.modalEndedBadge
                    }
                  >
                    <Ionicons
                      name="checkmark-done"
                      size={13}
                      color={
                        UI.purpleSoft
                      }
                    />

                    <Text
                      style={
                        styles.modalEndedText
                      }
                    >
                      Objetivo encerrado
                    </Text>
                  </View>
                </LinearGradient>

                {selectedTask.description?.trim() ? (
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
                ) : null}

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
                        ENCERRAMENTO
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
                  Pontuação
                </Text>

                <View
                  style={
                    styles.pointsDetailCard
                  }
                >
                  <View
                    style={
                      styles.pointsDetailIcon
                    }
                  >
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={
                        UI.purpleSoft
                      }
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.pointsDetailLabel
                      }
                    >
                      VALOR DO OBJETIVO
                    </Text>

                    <Text
                      style={
                        styles.pointsDetailValue
                      }
                    >
                      {
                        selectedTask.points
                      }{" "}
                      pontos
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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

    scrollContent: {
      paddingBottom: 60,
    },

    /*
     * HEADER
     */

    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,

      flexDirection: "row",

      alignItems: "flex-start",

      gap: 13,
    },

    backButton: {
      width: 42,
      height: 42,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        "#29344B",

      marginTop: 3,
    },

    headerContent: {
      flex: 1,
    },

    headerLabel: {
      color:
        UI.purpleBright,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 1.1,

      marginBottom: 3,
    },

    title: {
      color:
        theme.textPrimary,

      fontSize: 31,

      fontWeight: "900",

      letterSpacing: -0.8,
    },

    subtitle: {
      color:
        theme.textSecondary,

      fontSize: 12,

      lineHeight: 18,

      marginTop: 4,
    },

    /*
     * RESUMO
     */

    summaryCard: {
      marginHorizontal: 20,
      marginBottom: 19,

      padding: 19,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.18)",
    },

    summaryTop: {
      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },

    summaryIcon: {
      width: 45,
      height: 45,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.14)",
    },

    summaryLabel: {
      color:
        UI.purpleSoft,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 0.8,
    },

    summaryTitle: {
      color:
        theme.textPrimary,

      fontSize: 15,

      fontWeight: "800",

      marginTop: 3,
    },

    summaryDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 17,

      marginTop: 15,
    },

    summaryStats: {
      flexDirection: "row",

      marginTop: 17,

      paddingTop: 15,

      borderTopWidth: 1,

      borderTopColor:
        "rgba(255,255,255,0.06)",
    },

    summaryStat: {
      flex: 1,
    },

    summaryDivider: {
      width: 1,

      marginHorizontal: 15,

      backgroundColor:
        "rgba(255,255,255,0.07)",
    },

    summaryStatValue: {
      color:
        theme.textPrimary,

      fontSize: 21,

      fontWeight: "900",
    },

    summaryStatValuePurple: {
      color:
        UI.purpleSoft,

      fontSize: 21,

      fontWeight: "900",
    },

    summaryStatLabel: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 3,
    },

    /*
     * FILTROS
     */

    filterSection: {
      marginBottom: 18,
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
    },

    clearFilter: {
      color:
        UI.purpleSoft,

      fontSize: 10,

      fontWeight: "800",
    },

    filtersContainer: {
      paddingHorizontal: 20,

      gap: 8,
    },

    filterChip: {
      minHeight: 34,

      paddingHorizontal: 12,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",

      gap: 6,

      backgroundColor:
        UI.surfaceSoft,

      borderWidth: 1,

      borderColor:
        UI.borderSoft,
    },

    filterChipActive: {
      backgroundColor:
        "#2A2047",

      borderColor:
        "rgba(139,108,255,0.40)",
    },

    filterActiveDot: {
      width: 5,
      height: 5,

      borderRadius: 3,

      backgroundColor:
        UI.purpleBright,
    },

    filterText: {
      color:
        theme.textSecondary,

      fontSize: 10,

      fontWeight: "700",
    },

    filterTextActive: {
      color:
        "#E5DFFF",
    },

    /*
     * SEÇÃO
     */

    sectionHeader: {
      marginHorizontal: 20,
      marginBottom: 11,

      flexDirection: "row",

      alignItems: "flex-end",

      justifyContent:
        "space-between",
    },

    sectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,

      fontWeight: "800",
    },

    sectionSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 3,
    },

    sectionCounter: {
      minWidth: 28,
      height: 28,

      paddingHorizontal: 8,

      borderRadius: 9,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#211A37",
    },

    sectionCounterText: {
      color:
        UI.purpleSoft,

      fontSize: 10,

      fontWeight: "900",
    },

    /*
     * CARDS
     */

    historyCard: {
      marginHorizontal: 20,
      marginBottom: 10,

      minHeight: 106,

      padding: 14,

      borderRadius: 17,

      flexDirection: "row",

      alignItems: "center",

      gap: 12,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        "#222D42",
    },

    historyCardIcon: {
      width: 42,
      height: 42,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.10)",
    },

    historyCardContent: {
      flex: 1,
    },

    historyCardTop: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: 8,
    },

    historyGroup: {
      flex: 1,

      color:
        theme.primary,

      fontSize: 9,

      fontWeight: "800",
    },

    endedBadge: {
      paddingHorizontal: 7,

      height: 21,

      borderRadius: 7,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.09)",
    },

    endedBadgeText: {
      color:
        "#AFA3D8",

      fontSize: 7,

      fontWeight: "900",

      letterSpacing: 0.4,
    },

    historyTaskTitle: {
      color:
        theme.textPrimary,

      fontSize: 14,

      lineHeight: 19,

      fontWeight: "800",

      marginTop: 5,
    },

    historyFooter: {
      marginTop: 10,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    historyDateArea: {
      flex: 1,

      flexDirection: "row",

      alignItems: "center",

      gap: 5,
    },

    historyDateText: {
      color:
        theme.textSecondary,

      fontSize: 9,
    },

    historyPoints: {
      flexDirection: "row",

      alignItems: "center",

      gap: 4,

      marginLeft: 8,
    },

    historyPointsText: {
      color:
        UI.purpleSoft,

      fontSize: 10,

      fontWeight: "900",
    },

    /*
     * ESTADOS
     */

    stateContainer: {
      minHeight: 350,

      marginHorizontal: 20,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 30,
    },

    emptyState: {
      minHeight: 330,

      marginHorizontal: 20,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 34,
    },

    stateTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,

      fontWeight: "800",

      textAlign: "center",

      marginTop: 14,
    },

    stateDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 18,

      textAlign: "center",

      marginTop: 6,

      maxWidth: 270,
    },

    errorIcon: {
      width: 54,
      height: 54,

      borderRadius: 17,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.08)",
    },

    retryButton: {
      height: 44,

      marginTop: 18,

      paddingHorizontal: 18,

      borderRadius: 11,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 7,

      backgroundColor:
        UI.purpleBright,
    },

    retryButtonText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "800",
    },

    emptyDecoration: {
      width: 92,
      height: 92,

      alignItems: "center",
      justifyContent: "center",
    },

    emptyRing: {
      position: "absolute",

      width: 82,
      height: 82,

      borderRadius: 41,

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.13)",
    },

    emptyIcon: {
      width: 56,
      height: 56,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",
    },

    /*
     * MODAL
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
        "rgba(139,108,255,0.20)",
    },

    modalHeroIcon: {
      width: 56,
      height: 56,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.13)",

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

    modalEndedBadge: {
      marginTop: 14,

      minHeight: 29,

      paddingHorizontal: 10,

      borderRadius: 9,

      flexDirection: "row",

      alignItems: "center",

      gap: 5,

      backgroundColor:
        "rgba(139,108,255,0.11)",
    },

    modalEndedText: {
      color:
        UI.purpleSoft,

      fontSize: 9,

      fontWeight: "800",
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
      minHeight: 64,

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

    pointsDetailCard: {
      minHeight: 72,

      paddingHorizontal: 15,

      borderRadius: 15,

      flexDirection: "row",

      alignItems: "center",

      gap: 12,

      backgroundColor:
        theme.surface,
    },

    pointsDetailIcon: {
      width: 40,
      height: 40,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.12)",
    },

    pointsDetailLabel: {
      color:
        theme.textSecondary,

      fontSize: 8,

      fontWeight: "700",

      letterSpacing: 0.5,
    },

    pointsDetailValue: {
      color:
        UI.purpleSoft,

      fontSize: 14,

      fontWeight: "900",

      marginTop: 3,
    },
  });