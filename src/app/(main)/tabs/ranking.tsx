import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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

import { RankingHelpModal } from "@/components/RankingHelpModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  apiRequest,
} from "@/services/api";
import { colors } from "@/theme";

const theme = colors.dark;

const UI = {
  blue: "#6B8CFF",
  blueSoft: "#A9BAFF",

  purple: "#8B6CFF",
  purpleSoft: "#C2B5FF",

  cyan: "#62E5F4",
  pink: "#EC7AD9",

  surface: "#151E30",
  surfaceRaised: "#1A2438",

  muted: "#7D879C",
};

type RankingMember = {
  userId: string;
  name: string;
  points: number;
  position: number;
  profileImage: string | null;
};

type RankingGroup = {
  id: string;
  name: string;
  memberCount: number;
  position: number | null;
  points: number | null;
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
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeProfileImage(
  value: unknown,
): string | null {
  if (typeof value === "string") {
    return value.trim()
      ? value
      : null;
  }

  if (isRecord(value)) {
    return readString(value.url);
  }

  return null;
}

function normalizeGroups(
  response: unknown,
): RankingGroup[] {
  let rawGroups: unknown[] = [];

  if (Array.isArray(response)) {
    rawGroups = response;
  } else if (
    isRecord(response) &&
    Array.isArray(response.groups)
  ) {
    rawGroups = response.groups;
  }

  return rawGroups
    .map((rawGroup) => {
      if (!isRecord(rawGroup)) {
        return null;
      }

      const id =
        readString(rawGroup._id) ??
        readString(rawGroup.id);

      const name =
        readString(rawGroup.name);

      if (!id || !name) {
        return null;
      }

      let memberCount =
        readNumber(
          rawGroup.memberCount,
        ) ??
        readNumber(
          rawGroup.membersCount,
        ) ??
        0;

      if (
        Array.isArray(
          rawGroup.members,
        )
      ) {
        memberCount =
          rawGroup.members.length;
      }

      const group: RankingGroup = {
        id,
        name,
        memberCount,
        position: null,
        points: null,
      };

      return group;
    })
    .filter(
      (
        group,
      ): group is RankingGroup =>
        group !== null,
    );
}

function normalizeRanking(
  response: unknown,
): RankingMember[] {
  let rawRanking: unknown[] = [];

  if (Array.isArray(response)) {
    rawRanking = response;
  } else if (
    isRecord(response) &&
    Array.isArray(response.ranking)
  ) {
    rawRanking = response.ranking;
  } else if (
    isRecord(response) &&
    Array.isArray(response.members)
  ) {
    rawRanking = response.members;
  }

  return rawRanking
    .map((rawItem, index) => {
      if (!isRecord(rawItem)) {
        return null;
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

      if (!userId) {
        return null;
      }

      const name =
        readString(
          userData.name,
        ) ??
        readString(
          rawItem.name,
        ) ??
        "Usuário";

      const points =
        readNumber(
          rawItem.points,
        ) ??
        readNumber(
          userData.points,
        ) ??
        0;

      const position =
        readNumber(
          rawItem.position,
        ) ??
        readNumber(
          rawItem.rank,
        ) ??
        index + 1;

      const profileImage =
        normalizeProfileImage(
          userData.profileImage,
        ) ??
        normalizeProfileImage(
          rawItem.profileImage,
        );

      return {
        userId,
        name,
        points,
        position,
        profileImage,
      };
    })
    .filter(
      (
        member,
      ): member is RankingMember =>
        member !== null,
    )
    .sort(
      (a, b) =>
        a.position -
        b.position,
    );
}

function formatMembers(
  count: number,
) {
  return count === 1
    ? "1 membro"
    : `${count} membros`;
}

function formatPoints(
  points: number,
) {
  return points.toLocaleString(
    "pt-BR",
  );
}

function getRankVisual(
  position: number | null,
) {
  if (position === 1) {
    return {
      accent: UI.cyan,
      soft:
        "rgba(98,229,244,0.09)",
      border:
        "rgba(98,229,244,0.25)",
    };
  }

  if (position === 2) {
    return {
      accent: UI.purpleSoft,
      soft:
        "rgba(194,181,255,0.09)",
      border:
        "rgba(194,181,255,0.22)",
    };
  }

  if (position === 3) {
    return {
      accent: UI.pink,
      soft:
        "rgba(236,122,217,0.08)",
      border:
        "rgba(236,122,217,0.20)",
    };
  }

  return {
    accent: UI.blue,
    soft:
      "rgba(107,140,255,0.08)",
    border:
      "rgba(107,140,255,0.16)",
  };
}

export default function RankingScreen() {
  const {
    token,
    user,
  } = useAuth();

  const currentUserId =
    user?.id ?? user?._id;

  const [
    groups,
    setGroups,
  ] = useState<
    RankingGroup[]
  >([]);

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

  const [
    showHelp,
    setShowHelp,
  ] = useState(false);

  const carregarRankings =
    useCallback(
      async (
        refreshing = false,
      ) => {
        if (!token) {
          setGroups([]);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        try {
          if (refreshing) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }

          setError("");

          const groupsResponse =
            await apiRequest<unknown>(
              "/groups",
              {
                method: "GET",
                token,
              },
            );

          const basicGroups =
            normalizeGroups(
              groupsResponse,
            );

          const enrichedGroups =
            await Promise.all(
              basicGroups.map(
                async (group) => {
                  try {
                    const response =
                      await apiRequest<unknown>(
                        `/groups/${group.id}/ranking`,
                        {
                          method: "GET",
                          token,
                        },
                      );

                    const ranking =
                      normalizeRanking(
                        response,
                      );

                    const me =
                      currentUserId
                        ? ranking.find(
                            (
                              member,
                            ) =>
                              member.userId ===
                              currentUserId,
                          )
                        : undefined;

                    return {
                      ...group,

                      memberCount:
                        group.memberCount >
                        0
                          ? group.memberCount
                          : ranking.length,

                      position:
                        me?.position ??
                        null,

                      points:
                        me?.points ??
                        null,
                    };
                  } catch (
                    rankingError
                  ) {
                    console.error(
                      `Erro ao carregar ranking do grupo ${group.id}:`,
                      rankingError,
                    );

                    return group;
                  }
                },
              ),
            );

          setGroups(
            enrichedGroups,
          );
        } catch (error) {
          console.error(
            "Erro ao carregar rankings:",
            error,
          );

          if (
            error instanceof
            ApiError
          ) {
            setError(
              error.message,
            );
          } else {
            setError(
              "Não foi possível carregar seus rankings.",
            );
          }
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [
        token,
        currentUserId,
      ],
    );

  useFocusEffect(
    useCallback(() => {
      void carregarRankings();
    }, [carregarRankings]),
  );

  const bestPosition =
    useMemo(() => {
      const positions =
        groups
          .map(
            (group) =>
              group.position,
          )
          .filter(
            (
              position,
            ): position is number =>
              position !== null,
          );

      if (
        positions.length === 0
      ) {
        return null;
      }

      return Math.min(
        ...positions,
      );
    }, [groups]);

  const topThreeCount =
    useMemo(
      () =>
        groups.filter(
          (group) =>
            group.position !==
              null &&
            group.position <= 3,
        ).length,
      [groups],
    );

  function handlePressGrupo(
    group: RankingGroup,
  ) {
    router.push({
      pathname:
        "/ranking/[id]",

      params: {
        id: group.id,
        groupName:
          group.name,
      },
    });
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
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            color={theme.primary}
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Carregando ranking...
          </Text>
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
      <RankingHelpModal
        visible={showHelp}
        onClose={() =>
          setShowHelp(false)
        }
      />

      <FlatList
        data={groups}
        keyExtractor={(
          item,
        ) => item.id}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,

          groups.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing
            }
            onRefresh={() => {
              void carregarRankings(
                true,
              );
            }}
            tintColor={
              theme.primary
            }
            colors={[
              theme.primary,
            ]}
          />
        }
        ListHeaderComponent={
          <>
            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  Ranking
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Acompanhe sua posição
                  nos seus grupos.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={
                  0.75
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
                  size={22}
                  color={
                    UI.cyan
                  }
                />
              </TouchableOpacity>
            </View>

            {!error &&
              groups.length >
                0 && (
                <>
                  <LinearGradient
                    colors={[
                      "#15223A",
                      "#211A3D",
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
                        styles.summaryHeader
                      }
                    >
                      <View
                        style={
                          styles.summaryIcon
                        }
                      >
                        <Ionicons
                          name="stats-chart"
                          size={19}
                          color={
                            UI.blueSoft
                          }
                        />
                      </View>

                      <View>
                        <Text
                          style={
                            styles.summaryLabel
                          }
                        >
                          SEU DESEMPENHO
                        </Text>

                        <Text
                          style={
                            styles.summaryTitle
                          }
                        >
                          Continue avançando
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.summaryStats
                      }
                    >
                      <View
                        style={
                          styles.statItem
                        }
                      >
                        <Text
                          style={
                            styles.statValue
                          }
                        >
                          {
                            groups.length
                          }
                        </Text>

                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          grupos
                        </Text>
                      </View>

                      <View
                        style={
                          styles.statDivider
                        }
                      />

                      <View
                        style={
                          styles.statItem
                        }
                      >
                        <Text
                          style={[
                            styles.statValue,
                            styles.statHighlight,
                          ]}
                        >
                          {bestPosition
                            ? `#${bestPosition}`
                            : "—"}
                        </Text>

                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          melhor posição
                        </Text>
                      </View>

                      <View
                        style={
                          styles.statDivider
                        }
                      />

                      <View
                        style={
                          styles.statItem
                        }
                      >
                        <Text
                          style={[
                            styles.statValue,
                            styles.statHighlight,
                          ]}
                        >
                          {
                            topThreeCount
                          }
                        </Text>

                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          no top 3
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>

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
                        Seus grupos
                      </Text>

                      <Text
                        style={
                          styles.sectionSubtitle
                        }
                      >
                        Abra um grupo para
                        ver o pódio
                      </Text>
                    </View>

                    <View
                      style={
                        styles.sectionCount
                      }
                    >
                      <Text
                        style={
                          styles.sectionCountText
                        }
                      >
                        {
                          groups.length
                        }
                      </Text>
                    </View>
                  </View>
                </>
              )}
          </>
        }
        ListEmptyComponent={
          error ? (
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
                Ranking indisponível
              </Text>

              <Text
                style={
                  styles.stateDescription
                }
              >
                {error}
              </Text>

              <TouchableOpacity
                activeOpacity={
                  0.85
                }
                style={
                  styles.retryButton
                }
                onPress={() => {
                  void carregarRankings();
                }}
              >
                <Text
                  style={
                    styles.retryText
                  }
                >
                  Tentar novamente
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={
                styles.stateContainer
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="podium-outline"
                  size={30}
                  color={
                    UI.blueSoft
                  }
                />
              </View>

              <Text
                style={
                  styles.stateTitle
                }
              >
                Nenhum ranking ainda
              </Text>

              <Text
                style={
                  styles.stateDescription
                }
              >
                Seus grupos aparecerão
                aqui quando estiverem
                disponíveis.
              </Text>
            </View>
          )
        }
        renderItem={({
          item,
        }) => {
          const visual =
            getRankVisual(
              item.position,
            );

          return (
            <TouchableOpacity
              activeOpacity={
                0.86
              }
              style={
                styles.groupCard
              }
              onPress={() =>
                handlePressGrupo(
                  item,
                )
              }
            >
              <View
                style={[
                  styles.groupAccent,
                  {
                    backgroundColor:
                      visual.accent,
                  },
                ]}
              />

              <View
                style={[
                  styles.groupIcon,
                  {
                    backgroundColor:
                      visual.soft,
                  },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={19}
                  color={
                    visual.accent
                  }
                />
              </View>

              <View
                style={
                  styles.groupInfo
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.groupName
                  }
                >
                  {item.name}
                </Text>

                <View
                  style={
                    styles.groupMeta
                  }
                >
                  <Text
                    style={
                      styles.metaText
                    }
                  >
                    {formatMembers(
                      item.memberCount,
                    )}
                  </Text>

                  {item.points !==
                    null && (
                    <>
                      <View
                        style={
                          styles.metaDot
                        }
                      />

                      <Text
                        style={
                          styles.pointsText
                        }
                      >
                        {formatPoints(
                          item.points,
                        )}{" "}
                        pts
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <View
                style={
                  styles.groupRight
                }
              >
                <View
                  style={[
                    styles.rankBadge,
                    {
                      backgroundColor:
                        visual.soft,
                      borderColor:
                        visual.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rankBadgeText,
                      {
                        color:
                          visual.accent,
                      },
                    ]}
                  >
                    {item.position
                      ? `#${item.position}`
                      : "—"}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    UI.muted
                  }
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
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

    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 115,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      paddingTop: 18,
      paddingBottom: 23,
    },

    headerText: {
      flex: 1,
    },

    title: {
      color:
        theme.textPrimary,

      fontSize: 23,
      fontWeight: "800",

      letterSpacing: -0.4,
    },

    subtitle: {
      color:
        theme.textSecondary,

      fontSize: 13,

      marginTop: 6,
    },

    helpButton: {
      width: 43,
      height: 43,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surface,

      borderWidth: 1,
      borderColor:
        theme.border,

      marginLeft: 14,
    },

    summaryCard: {
      borderRadius: 23,

      borderWidth: 1,
      borderColor:
        "rgba(107,140,255,0.18)",

      padding: 17,

      marginBottom: 28,
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom: 18,
    },

    summaryIcon: {
      width: 46,
      height: 46,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(107,140,255,0.11)",

      marginRight: 12,
    },

    summaryLabel: {
      color:
        UI.purpleSoft,

      fontSize: 9,
      fontWeight: "800",

      letterSpacing: 1.4,

      marginBottom: 4,
    },

    summaryTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,
      fontWeight: "800",
    },

    summaryStats: {
      flexDirection: "row",
      alignItems: "center",

      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.07)",

      paddingTop: 15,
    },

    statItem: {
      flex: 1,
    },

    statDivider: {
      width: 1,
      height: 36,

      backgroundColor:
        "rgba(255,255,255,0.07)",

      marginHorizontal: 12,
    },

    statValue: {
      color:
        theme.textPrimary,

      fontSize: 22,
      fontWeight: "800",

      marginBottom: 3,
    },

    statHighlight: {
      color:
        UI.blueSoft,
    },

    statLabel: {
      color:
        theme.textSecondary,

      fontSize: 10,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-between",

      marginBottom: 14,
    },

    sectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 21,
      fontWeight: "800",
    },

    sectionSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 11,

      marginTop: 3,
    },

    sectionCount: {
      minWidth: 34,
      height: 34,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surface,

      borderWidth: 1,
      borderColor:
        theme.border,
    },

    sectionCountText: {
      color:
        theme.textPrimary,

      fontSize: 12,
      fontWeight: "700",
    },

    groupCard: {
      minHeight: 88,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        UI.surface,

      borderWidth: 1,
      borderColor:
        theme.border,

      borderRadius: 19,

      paddingHorizontal: 14,
      paddingVertical: 14,

      marginBottom: 11,

      overflow: "hidden",
    },

    groupAccent: {
      position: "absolute",

      left: 0,
      top: 15,
      bottom: 15,

      width: 3,

      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },

    groupIcon: {
      width: 43,
      height: 43,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",

      marginRight: 12,
    },

    groupInfo: {
      flex: 1,
      minWidth: 0,
    },

    groupName: {
      color:
        theme.textPrimary,

      fontSize: 15,
      fontWeight: "700",
    },

    groupMeta: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 6,
    },

    metaText: {
      color:
        theme.textSecondary,

      fontSize: 10,
    },

    metaDot: {
      width: 3,
      height: 3,

      borderRadius: 2,

      backgroundColor:
        UI.muted,

      marginHorizontal: 7,
    },

    pointsText: {
      color:
        UI.blueSoft,

      fontSize: 10,
      fontWeight: "700",
    },

    groupRight: {
      flexDirection: "row",
      alignItems: "center",

      gap: 9,

      marginLeft: 10,
    },

    rankBadge: {
      minWidth: 46,
      height: 35,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 9,

      borderWidth: 1,
    },

    rankBadgeText: {
      fontSize: 13,
      fontWeight: "800",
    },

    loadingContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      gap: 12,
    },

    loadingText: {
      color:
        theme.textSecondary,

      fontSize: 13,
    },

    stateContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 30,
      paddingBottom: 90,
    },

    errorIcon: {
      width: 58,
      height: 58,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.08)",

      marginBottom: 15,
    },

    emptyIcon: {
      width: 58,
      height: 58,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surfaceRaised,

      marginBottom: 15,
    },

    stateTitle: {
      color:
        theme.textPrimary,

      fontSize: 18,
      fontWeight: "700",

      textAlign: "center",
    },

    stateDescription: {
      color:
        theme.textSecondary,

      fontSize: 13,
      lineHeight: 19,

      textAlign: "center",

      maxWidth: 270,

      marginTop: 6,
    },

    retryButton: {
      height: 43,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 17,

      backgroundColor:
        theme.primary,

      marginTop: 17,
    },

    retryText: {
      color: "#FFFFFF",

      fontSize: 13,
      fontWeight: "700",
    },
  });