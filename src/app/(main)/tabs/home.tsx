import React, {
  useCallback,
  useState,
} from "react";

import {
  Image,
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
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from "@/services/api";
import { colors } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";
import { submissionService } from "@/services/submissionService";
import { taskService } from "@/services/taskService";

import { Task } from "@/types/task";
import { TaskSubmission } from "@/types/submission";

const theme = colors.dark;

const UI = {
  blue: "#6687FF",
  blueSoft: "#AAB9FF",

  purple: "#8B6CFF",
  purpleSoft: "#C3B5FF",

  cyan: "#66E3F2",

  surface: "#151E30",
  surfaceRaised: "#1A2438",

  textMuted: "#7F899D",
};

function getSubmissionTaskId(
  submission: TaskSubmission,
) {
  if (
    typeof submission.task ===
    "string"
  ) {
    return submission.task;
  }

  return submission.task._id;
}

function getSubmissionForTask(
  task: Task,
  submissions: TaskSubmission[],
) {
  return submissions.find(
    (submission) =>
      getSubmissionTaskId(
        submission,
      ) === task._id,
  );
}

function getTaskGroupName(
  task: Task,
) {
  if (
    typeof task.group ===
    "string"
  ) {
    return "Grupo";
  }

  return task.group.name;
}

type HomeRanking = {
  id: string;
  name: string;
  pos: number;
  points: number;
};

type HomeGroup = {
  id: string;
  name: string;
};

type UnknownRecord = Record<
  string,
  unknown
>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  return value;
}

function readNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return null;
}

function normalizeHomeGroups(
  response: unknown,
): HomeGroup[] {
  let rawGroups: unknown[] =
    [];

  if (
    Array.isArray(response)
  ) {
    rawGroups = response;
  } else if (
    isRecord(response) &&
    Array.isArray(
      response.groups,
    )
  ) {
    rawGroups =
      response.groups;
  }

  return rawGroups
    .map((rawGroup) => {
      if (
        !isRecord(rawGroup)
      ) {
        return null;
      }

      const id =
        readString(
          rawGroup._id,
        ) ??
        readString(
          rawGroup.id,
        );

      const name =
        readString(
          rawGroup.name,
        );

      if (!id || !name) {
        return null;
      }

      return {
        id,
        name,
      };
    })
    .filter(
      (
        group,
      ): group is HomeGroup =>
        group !== null,
    );
}

function getMyRankingFromResponse(
  response: unknown,
  currentUserId: string,
) {
  let rawRanking: unknown[] =
    [];

  if (
    Array.isArray(response)
  ) {
    rawRanking = response;
  } else if (
    isRecord(response) &&
    Array.isArray(
      response.ranking,
    )
  ) {
    rawRanking =
      response.ranking;
  } else if (
    isRecord(response) &&
    Array.isArray(
      response.members,
    )
  ) {
    rawRanking =
      response.members;
  }

  for (
    let index = 0;
    index <
    rawRanking.length;
    index++
  ) {
    const rawItem =
      rawRanking[index];

    if (
      !isRecord(rawItem)
    ) {
      continue;
    }

    const rawUser =
      rawItem.user;

    const userData =
      isRecord(rawUser)
        ? rawUser
        : rawItem;

    const userId =
      readString(
        userData._id,
      ) ??
      readString(
        userData.id,
      ) ??
      readString(
        rawItem.userId,
      ) ??
      (typeof rawUser ===
      "string"
        ? rawUser
        : null);

    if (
      userId !==
      currentUserId
    ) {
      continue;
    }

    const position =
      readNumber(
        rawItem.position,
      ) ??
      readNumber(
        rawItem.rank,
      ) ??
      index + 1;

    const points =
      readNumber(
        rawItem.points,
      ) ??
      readNumber(
        userData.points,
      ) ??
      0;

    return {
      position,
      points,
    };
  }

  return null;
}

function getGoalVisual(
  submission?:
    TaskSubmission,
) {
  if (!submission) {
    return {
      color: UI.blueSoft,

      background:
        "rgba(102,135,255,0.09)",

      icon:
        "time-outline" as const,

      label: "Pendente",
    };
  }

  if (
    submission.status ===
    "voting"
  ) {
    return {
      color: UI.purpleSoft,

      background:
        "rgba(139,108,255,0.10)",

      icon:
        "people-outline" as const,

      label: "Em votação",
    };
  }

  if (
    submission.status ===
    "invalidated"
  ) {
    return {
      color: theme.error,

      background:
        "rgba(239,68,68,0.08)",

      icon:
        "close-circle-outline" as const,

      label: "Invalidado",
    };
  }

  return {
    color: theme.success,

    background:
      "rgba(34,197,94,0.09)",

    icon:
      "checkmark-circle" as const,

    label: "Evidência enviada",
  };
}

function getRankColor(
  position: number,
) {
  if (position === 1) {
    return UI.cyan;
  }

  if (position === 2) {
    return UI.purpleSoft;
  }

  if (position === 3) {
    return UI.blueSoft;
  }

  return theme.textSecondary;
}

/* =========================================================
   SCREEN
========================================================= */

export default function HomeScreen() {
  const {
      token,
      user,
    } = useAuth();

    const currentUserId =
      user?.id ?? user?._id;

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>(
    [],
  );

  const [
    mySubmissions,
    setMySubmissions,
  ] = useState<
    TaskSubmission[]
  >([]);

  const [
      rankings,
      setRankings,
    ] = useState<
      HomeRanking[]
    >([]);

  const carregarHome =
  useCallback(
    async () => {
      if (!token) {
        setTasks([]);
        setMySubmissions(
          [],
        );
        setRankings([]);

        return;
      }

      try {
        const [
          tasksResponse,
          submissionsResponse,
          groupsResponse,
        ] =
          await Promise.all([
            taskService.getMyTasks(
              token,
            ),

            submissionService.getMySubmissions(
              token,
            ),

            apiRequest<unknown>(
              "/groups",
              {
                method:
                  "GET",
                token,
              },
            ),
          ]);

        setTasks(
          tasksResponse.tasks,
        );

        setMySubmissions(
          submissionsResponse.submissions,
        );

        const groups =
          normalizeHomeGroups(
            groupsResponse,
          );

        if (!currentUserId) {
          setRankings([]);
          return;
        }

        const rankingResults =
          await Promise.all(
            groups.map(
              async (group) => {
                try {
                  const response =
                    await apiRequest<unknown>(
                      `/groups/${group.id}/ranking`,
                      {
                        method:
                          "GET",
                        token,
                      },
                    );

                  const myRanking =
                    getMyRankingFromResponse(
                      response,
                      currentUserId,
                    );

                  if (
                    !myRanking
                  ) {
                    return null;
                  }

                  const ranking: HomeRanking =
                    {
                      id:
                        group.id,

                      name:
                        group.name,

                      pos:
                        myRanking.position,

                      points:
                        myRanking.points,
                    };

                  return ranking;
                } catch (error) {
                  console.error(
                    `Erro ao carregar ranking do grupo ${group.id}:`,
                    error,
                  );

                  return null;
                }
              },
            ),
          );

        const validRankings =
          rankingResults
            .filter(
              (
                ranking,
              ): ranking is HomeRanking =>
                ranking !==
                null,
            )
            .sort(
              (a, b) =>
                a.pos -
                  b.pos ||
                b.points -
                  a.points,
            );

        setRankings(
          validRankings,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar a Home:",
          error,
        );

        setTasks([]);
        setMySubmissions(
          [],
        );
        setRankings([]);
      }
    },
    [
      token,
      currentUserId,
    ],
  );

  useFocusEffect(
    useCallback(() => {
      void carregarHome();
    }, [carregarHome]),
  );

  const totalGoals =
    tasks.length;

  const completedGoals =
    tasks.filter(
      (task) => {
        const submission =
          getSubmissionForTask(
            task,
            mySubmissions,
          );

        return (
          submission !==
            undefined &&
          submission.status !==
            "invalidated"
        );
      },
    ).length;

  const pct =
    totalGoals > 0
      ? Math.round(
          (completedGoals /
            totalGoals) *
            100,
        )
      : 0;

  const homeGoals =
    tasks.slice(0, 3);

  const homeRankings =
  rankings.slice(0, 3);

  const totalPts =
    rankings.reduce(
      (
        total,
        ranking,
      ) =>
        total +
        ranking.points,
      0,
    );

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
        {/* BRAND */}

        <View
          style={
            styles.brandHeader
          }
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../assets/images/axon-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View
            style={
              styles.brandText
            }
          >
            <Text
              style={
                styles.brandName
              }
            >
              AXON
            </Text>

            <Text
              style={
                styles.brandTagline
              }
            >
              FOCO • CONSTÂNCIA • EVOLUÇÃO
            </Text>
          </View>
        </View>

        {/* INTRO */}

        <View
          style={
            styles.intro
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Seu dia
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Seu progresso em um só
            lugar.
          </Text>
        </View>

        {/* PROGRESSO */}

        <LinearGradient
          colors={[
            "#17243B",
            "#211A3C",
            "#291C46",
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
              styles.progressHeader
            }
          >
            <View>
              <Text
                style={
                  styles.progressEyebrow
                }
              >
                PROGRESSO DE HOJE
              </Text>

              <View
                style={
                  styles.percentRow
                }
              >
                <Text
                  style={
                    styles.percentValue
                  }
                >
                  {pct}
                </Text>

                <Text
                  style={
                    styles.percentSymbol
                  }
                >
                  %
                </Text>
              </View>

              <Text
                style={
                  styles.progressDescription
                }
              >
                {completedGoals} de{" "}
                {totalGoals} objetivos
                concluídos
              </Text>
            </View>

            <View
              style={
                styles.progressVisual
              }
            >
              <View
                style={
                  styles.progressVisualOuter
                }
              >
                <View
                  style={
                    styles.progressVisualInner
                  }
                >
                  <Ionicons
                    name="trending-up"
                    size={23}
                    color={
                      UI.cyan
                    }
                  />
                </View>
              </View>

              <Text
                style={
                  styles.progressVisualLabel
                }
              >
                hoje
              </Text>
            </View>
          </View>

          <View
            style={
              styles.progressTrack
            }
          >
            <LinearGradient
              colors={[
                UI.blue,
                UI.purple,
                UI.cyan,
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={[
                styles.progressFill,
                {
                  width:
                    `${Math.min(
                      pct,
                      100,
                    )}%`,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.metricsRow
            }
          >
            <View
              style={
                styles.metric
              }
            >
              <View
                style={
                  styles.metricIcon
                }
              >
                <Ionicons
                  name="sparkles-outline"
                  size={15}
                  color={
                    UI.blueSoft
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {totalPts}
                </Text>

                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  pontos
                </Text>
              </View>
            </View>

            <View
              style={
                styles.metricDivider
              }
            />

            <View
              style={
                styles.metric
              }
            >
              <View
                style={
                  styles.metricIcon
                }
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={15}
                  color={
                    UI.purpleSoft
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {
                    completedGoals
                  }
                </Text>

                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  concluídos
                </Text>
              </View>
            </View>

            <View
              style={
                styles.metricDivider
              }
            />

            <View
              style={
                styles.metric
              }
            >
              <View
                style={
                  styles.metricIcon
                }
              >
                <Ionicons
                  name="hourglass-outline"
                  size={14}
                  color={
                    UI.cyan
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {Math.max(
                    totalGoals -
                      completedGoals,
                    0,
                  )}
                </Text>

                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  restantes
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* OBJETIVOS */}

        <View
          style={
            styles.section
          }
        >
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
                Próximos objetivos
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                O que precisa da sua
                atenção agora
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={
                0.75
              }
              style={
                styles.seeAllButton
              }
              onPress={() =>
                router.push(
                  "/(main)/tabs/objetivos",
                )
              }
            >
              <Text
                style={
                  styles.seeAllText
                }
              >
                Ver todos
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  UI.blueSoft
                }
              />
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.goalsCard
            }
          >
            {homeGoals.map(
              (
                goal,
                index,
              ) => {
                const submission =
                  getSubmissionForTask(
                    goal,
                    mySubmissions,
                  );

                const visual =
                  getGoalVisual(
                    submission,
                  );

                return (
                  <React.Fragment
                    key={
                      goal._id
                    }
                  >
                    <TouchableOpacity
                      activeOpacity={
                        0.82
                      }
                      style={
                        styles.goalRow
                      }
                      onPress={() =>
                        router.push(
                          "/(main)/tabs/objetivos",
                        )
                      }
                    >
                      <View
                        style={[
                          styles.goalIcon,
                          {
                            backgroundColor:
                              visual.background,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            visual.icon
                          }
                          size={18}
                          color={
                            visual.color
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.goalInfo
                        }
                      >
                        <Text
                          style={
                            styles.goalTitle
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            goal.title
                          }
                        </Text>

                        <View
                          style={
                            styles.goalMeta
                          }
                        >
                          <Text
                            style={
                              styles.goalGroup
                            }
                          >
                            {getTaskGroupName(
                              goal,
                            )}
                          </Text>

                          <View
                            style={
                              styles.metaDot
                            }
                          />

                          <Text
                            style={[
                              styles.goalStatus,
                              {
                                color:
                                  visual.color,
                              },
                            ]}
                          >
                            {
                              visual.label
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.pointsContainer
                        }
                      >
                        <Text
                          style={
                            styles.goalPoints
                          }
                        >
                          +
                          {
                            goal.points
                          }
                        </Text>

                        <Text
                          style={
                            styles.pointsLabel
                          }
                        >
                          pts
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {index <
                      homeGoals.length -
                        1 && (
                      <View
                        style={
                          styles.rowDivider
                        }
                      />
                    )}
                  </React.Fragment>
                );
              },
            )}
          </View>
        </View>

        {/* RANKING */}

        <View
          style={
            styles.section
          }
        >
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
                Seus rankings
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Sua posição nos grupos
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={
                0.75
              }
              style={
                styles.seeAllButton
              }
              onPress={() =>
                router.push(
                  "/(main)/tabs/ranking",
                )
              }
            >
              <Text
                style={
                  styles.seeAllText
                }
              >
                Ver todos
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={
                  UI.blueSoft
                }
              />
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.rankingRow
            }
          >
            {homeRankings.map(
              (ranking) => {
                const accent =
                  getRankColor(
                    ranking.pos,
                  );

                return (
                  <TouchableOpacity
                    key={
                      ranking.id
                    }
                    activeOpacity={
                      0.82
                    }
                    style={[
                      styles.rankCard,

                      ranking.pos ===
                        1 &&
                        styles.rankCardFirst,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/ranking/[id]",

                        params: {
                          id:
                            ranking.id,

                          groupName:
                            ranking.name,
                        },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.rankAccent,
                        {
                          backgroundColor:
                            accent,
                        },
                      ]}
                    />

                    <View
                      style={[
                        styles.rankIcon,
                        {
                          backgroundColor:
                            `${accent}14`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          ranking.pos ===
                          1
                            ? "trophy-outline"
                            : "podium-outline"
                        }
                        size={17}
                        color={
                          accent
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.rankPosition,
                        {
                          color:
                            accent,
                        },
                      ]}
                    >
                      #
                      {
                        ranking.pos
                      }
                    </Text>

                    <Text
                      style={
                        styles.rankName
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {
                        ranking.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.rankPoints
                      }
                    >
                      {
                        ranking.points
                      }{" "}
                      pts
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* FINAL */}

        <View
          style={
            styles.footerMessage
          }
        >
          <View
            style={
              styles.footerLine
            }
          />

          <Text
            style={
              styles.footerText
            }
          >
            Continue evoluindo, um
            objetivo de cada vez.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        theme.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 120,
    },

    /* BRAND */

    brandHeader: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom: 21,
    },

    logoContainer: {
        width: 48,
        height: 48,

        alignItems: "center",
        justifyContent: "center",

        marginRight: 12,
      },

      logo: {
        width: 46,
        height: 46,
      },

    brandText: {
      justifyContent: "center",
    },

    brandName: {
      color:
        theme.textPrimary,

      fontSize: 20,
      lineHeight: 22,

      fontWeight: "900",

      letterSpacing: 2.4,
    },

    brandTagline: {
      color:
        UI.purpleSoft,

      fontSize: 7,
      fontWeight: "700",

      letterSpacing: 1.1,

      marginTop: 4,
    },

    /* INTRO */

    intro: {
      marginBottom: 17,
    },

   title: {
      color:
        theme.textPrimary,

      fontSize: 21,
      lineHeight: 26,

      fontWeight: "800",

      letterSpacing: -0.35,
    },

    subtitle: {
      color:
        theme.textSecondary,

      fontSize: 13,
      lineHeight: 18,

      marginTop: 4,
    },

    /* PROGRESS */

    progressCard: {
      borderRadius: 23,

      padding: 17,

      borderWidth: 1,
      borderColor:
        "rgba(139,108,255,0.23)",

      marginBottom: 30,
    },

    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    progressEyebrow: {
      color:
        UI.purpleSoft,

      fontSize: 8,
      fontWeight: "900",

      letterSpacing: 1.35,

      marginBottom: 4,
    },

    percentRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    percentValue: {
      color:
        theme.textPrimary,

      fontSize: 40,
      lineHeight: 44,

      fontWeight: "900",

      letterSpacing: -1.5,
    },

    percentSymbol: {
      color:
        UI.cyan,

      fontSize: 16,
      fontWeight: "800",

      marginTop: 4,
      marginLeft: 2,
    },

    progressDescription: {
      color:
        theme.textSecondary,

      fontSize: 10,

      marginTop: 2,
    },

    progressVisual: {
      alignItems: "center",
      justifyContent: "center",

      marginLeft: 12,
    },

    progressVisualOuter: {
      width: 62,
      height: 62,

      borderRadius: 31,

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,
      borderColor:
        "rgba(102,135,255,0.22)",

      backgroundColor:
        "rgba(102,135,255,0.035)",
    },

    progressVisualInner: {
      width: 44,
      height: 44,

      borderRadius: 22,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(98,229,244,0.055)",
    },

    progressVisualLabel: {
      color:
        theme.textSecondary,

      fontSize: 7,

      marginTop: 4,
    },

    progressTrack: {
      height: 5,

      borderRadius: 999,

      backgroundColor:
        "rgba(255,255,255,0.07)",

      overflow: "hidden",

      marginTop: 15,
    },

    progressFill: {
      height: "100%",

      borderRadius: 999,
    },

    metricsRow: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 16,
    },

    metric: {
      flex: 1,

      flexDirection: "row",
      alignItems: "center",

      gap: 7,
    },

    metricIcon: {
      width: 26,
      height: 26,

      borderRadius: 9,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(255,255,255,0.04)",
    },

    metricValue: {
      color:
        theme.textPrimary,

      fontSize: 12,
      fontWeight: "800",
    },

    metricLabel: {
      color:
        theme.textSecondary,

      fontSize: 7,

      marginTop: 1,
    },

    metricDivider: {
      width: 1,
      height: 29,

      backgroundColor:
        "rgba(255,255,255,0.07)",

      marginHorizontal: 8,
    },

    /* SECTIONS */

    section: {
      marginBottom: 30,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-between",

      marginBottom: 13,
    },

    sectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 19,
      fontWeight: "800",

      letterSpacing: -0.25,
    },

    sectionSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 10,

      marginTop: 3,
    },

    seeAllButton: {
      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 6,

      gap: 2,
    },

    seeAllText: {
      color:
        UI.blueSoft,

      fontSize: 10,
      fontWeight: "700",
    },

    /* GOALS */

    goalsCard: {
      backgroundColor:
        UI.surface,

      borderRadius: 20,

      borderWidth: 1,
      borderColor:
        theme.border,

      paddingHorizontal: 13,
    },

    goalRow: {
      minHeight: 72,

      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 11,
    },

    goalIcon: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      marginRight: 11,
    },

    goalInfo: {
      flex: 1,
      minWidth: 0,
    },

    goalTitle: {
      color:
        theme.textPrimary,

      fontSize: 13,
      fontWeight: "700",

      lineHeight: 17,
    },

    goalMeta: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 5,
    },

    goalGroup: {
      color:
        theme.textSecondary,

      fontSize: 9,
    },

    goalStatus: {
      fontSize: 9,
      fontWeight: "700",
    },

    metaDot: {
      width: 3,
      height: 3,

      borderRadius: 2,

      backgroundColor:
        UI.textMuted,

      marginHorizontal: 6,
    },

    pointsContainer: {
      minWidth: 39,

      alignItems: "flex-end",

      marginLeft: 8,
    },

    goalPoints: {
      color:
        UI.blueSoft,

      fontSize: 11,
      fontWeight: "800",
    },

    pointsLabel: {
      color:
        theme.textSecondary,

      fontSize: 7,

      marginTop: 1,
    },

    rowDivider: {
      height: 1,

      backgroundColor:
        "rgba(255,255,255,0.055)",

      marginLeft: 51,
    },

    /* RANKING */

    rankingRow: {
      flexDirection: "row",

      gap: 10,
    },

    rankCard: {
      flex: 1,

      minHeight: 138,

      alignItems: "center",

      paddingHorizontal: 8,
      paddingVertical: 14,

      borderRadius: 19,

      backgroundColor:
        UI.surface,

      borderWidth: 1,
      borderColor:
        theme.border,

      overflow: "hidden",
    },

    rankCardFirst: {
      backgroundColor:
        "#152238",

      borderColor:
        "rgba(98,229,244,0.20)",
    },

    rankAccent: {
      position: "absolute",

      top: 0,

      width: 42,
      height: 2,

      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
    },

    rankIcon: {
      width: 34,
      height: 34,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      marginBottom: 8,
    },

    rankPosition: {
      fontSize: 21,
      fontWeight: "900",
    },

    rankName: {
      color:
        theme.textPrimary,

      fontSize: 10,
      fontWeight: "700",

      textAlign: "center",

      marginTop: 7,

      width: "100%",
    },

    rankPoints: {
      color:
        theme.textSecondary,

      fontSize: 8,

      marginTop: 3,
    },

    /* FOOTER */

    footerMessage: {
      alignItems: "center",

      paddingTop: 2,
      paddingBottom: 8,
    },

    footerLine: {
      width: 28,
      height: 2,

      borderRadius: 2,

      backgroundColor:
        UI.purple,

      marginBottom: 8,
    },

    footerText: {
      color:
        theme.textSecondary,

      fontSize: 9,

      textAlign: "center",
    },
  });