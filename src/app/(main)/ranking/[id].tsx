import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
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

import { RankingHelpModal } from "@/components/RankingHelpModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  apiRequest,
} from "@/services/api";
import { groupService } from "@/services/groupService";
import { colors } from "@/theme";

const theme = colors.dark;

const UI = {
  blue: "#6B8CFF",
  blueSoft: "#A9BAFF",

  purple: "#8B6CFF",
  purpleSoft: "#C2B5FF",

  cyan: "#62E5F4",
  pink: "#EC7AD9",

  surface: "#141D2F",
  surfaceRaised: "#192338",

  muted: "#7D879C",
};

type RankingMember = {
  userId: string;
  name: string;
  points: number;
  position: number;
  profileImage: string | null;
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
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return null;
}

function normalizeProfileImage(
  value: unknown,
): string | null {
  if (
    typeof value === "string"
  ) {
    return value.trim()
      ? value
      : null;
  }

  if (isRecord(value)) {
    return readString(
      value.url,
    );
  }

  return null;
}

function normalizeRanking(
  response: unknown,
): RankingMember[] {
  let rawRanking: unknown[] = [];

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

  return rawRanking
    .map(
      (
        rawItem,
        index,
      ) => {
        if (
          !isRecord(rawItem)
        ) {
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
      },
    )
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

function getInitials(
  name: string,
) {
  const names =
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2);

  const initials =
    names
      .map((name) =>
        name
          .charAt(0)
          .toUpperCase(),
      )
      .join("");

  return initials || "U";
}

function formatPoints(
  points: number,
) {
  return points.toLocaleString(
    "pt-BR",
  );
}

function getPlaceVisual(
  place: 1 | 2 | 3,
) {
  if (place === 1) {
    return {
      accent: UI.cyan,

      border:
        "rgba(98,229,244,0.34)",

      gradient: [
        "#17334A",
        "#182A41",
        "#172337",
      ] as const,
    };
  }

  if (place === 2) {
    return {
      accent:
        UI.purpleSoft,

      border:
        "rgba(194,181,255,0.27)",

      gradient: [
        "#292542",
        "#23233A",
        "#1B2337",
      ] as const,
    };
  }

  return {
    accent: UI.pink,

    border:
      "rgba(236,122,217,0.25)",

    gradient: [
      "#33223D",
      "#282039",
      "#1D2336",
    ] as const,
  };
}

type AvatarProps = {
  member: RankingMember;
  size: number;
  borderColor?: string;
};

function MemberAvatar({
  member,
  size,
  borderColor,
}: AvatarProps) {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius:
      size / 2,
  };

  if (
    member.profileImage
  ) {
    return (
      <Image
        source={{
          uri:
            member.profileImage,
        }}
        style={[
          styles.avatarImage,
          avatarStyle,

          borderColor
            ? {
                borderWidth: 2,
                borderColor,
              }
            : null,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        avatarStyle,

        borderColor
          ? {
              borderWidth: 2,
              borderColor,
            }
          : null,
      ]}
    >
      <Text
        style={[
          styles.avatarInitials,

          {
            fontSize:
              Math.max(
                12,
                size * 0.3,
              ),
          },
        ]}
      >
        {getInitials(
          member.name,
        )}
      </Text>
    </View>
  );
}

type PodiumMemberProps = {
  member: RankingMember;
  place: 1 | 2 | 3;
};

function PodiumMember({
  member,
  place,
}: PodiumMemberProps) {
  const visual =
    getPlaceVisual(place);

  const isFirst =
    place === 1;

  return (
    <View
      style={
        styles.podiumMember
      }
    >
      <View
        style={
          styles.podiumPerson
        }
      >
        {isFirst ? (
          <View
            style={
              styles.leaderIndicator
            }
          >
            <Ionicons
              name="sparkles"
              size={11}
              color={UI.cyan}
            />

            <Text
              style={
                styles.leaderText
              }
            >
              DESTAQUE
            </Text>
          </View>
        ) : (
          <View
            style={{
              height: 25,
            }}
          />
        )}

        <View
          style={[
            isFirst &&
              styles.firstAvatarRing,
          ]}
        >
          <MemberAvatar
            member={member}
            size={
              isFirst
                ? 70
                : 57
            }
            borderColor={
              visual.accent
            }
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.podiumName,

            isFirst &&
              styles.firstName,
          ]}
        >
          {member.name}
        </Text>

        <Text
          style={[
            styles.podiumPoints,

            isFirst && {
              color:
                UI.cyan,
            },
          ]}
        >
          {formatPoints(
            member.points,
          )}{" "}
          pts
        </Text>
      </View>

      <LinearGradient
        colors={visual.gradient}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 0,
          y: 1,
        }}
        style={[
          styles.podiumBlock,

          place === 1 &&
            styles.firstBlock,

          place === 2 &&
            styles.secondBlock,

          place === 3 &&
            styles.thirdBlock,

          {
            borderColor:
              visual.border,
          },
        ]}
      >
        <Text
          style={[
            styles.podiumPosition,
            {
              color:
                visual.accent,
            },
          ]}
        >
          {place}º
        </Text>
      </LinearGradient>
    </View>
  );
}

export default function RankingGrupoScreen() {
  const params =
    useLocalSearchParams<{
      id?:
        | string
        | string[];

      groupName?:
        | string
        | string[];
    }>();

  const groupId =
    Array.isArray(
      params.id,
    )
      ? params.id[0]
      : params.id;

  const groupNameParam =
    Array.isArray(
      params.groupName,
    )
      ? params.groupName[0]
      : params.groupName;

  const {
    token,
    user,
  } = useAuth();

  const currentUserId =
    user?.id ??
    user?._id;

  const [
    groupName,
    setGroupName,
  ] = useState(
    groupNameParam ??
      "Ranking",
  );

  const [
    ranking,
    setRanking,
  ] = useState<
    RankingMember[]
  >([]);

  const [
    memberCount,
    setMemberCount,
  ] = useState(0);

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

  const carregarRanking =
    useCallback(
      async (
        refreshing = false,
      ) => {
        if (
          !token ||
          !groupId
        ) {
          setError(
            "Não foi possível identificar este grupo.",
          );

          setIsLoading(
            false,
          );

          setIsRefreshing(
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
            setIsLoading(
              true,
            );
          }

          setError("");

          const [
            rankingResponse,
            groupResponse,
          ] =
            await Promise.all([
              apiRequest<unknown>(
                `/groups/${groupId}/ranking`,
                {
                  method:
                    "GET",
                  token,
                },
              ),

              groupService.getGroupById(
                groupId,
                token,
              ),
            ]);

          const normalizedRanking =
            normalizeRanking(
              rankingResponse,
            );

          setRanking(
            normalizedRanking,
          );

          setGroupName(
            groupResponse.name ||
              groupNameParam ||
              "Ranking",
          );

          setMemberCount(
            groupResponse
              .members
              ?.length ??
              normalizedRanking.length,
          );
        } catch (error) {
          console.error(
            "Erro ao carregar ranking do grupo:",
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
              "Não foi possível carregar o ranking deste grupo.",
            );
          }
        } finally {
          setIsLoading(
            false,
          );

          setIsRefreshing(
            false,
          );
        }
      },
      [
        token,
        groupId,
        groupNameParam,
      ],
    );

  useFocusEffect(
    useCallback(() => {
      void carregarRanking();
    }, [carregarRanking]),
  );

  const currentMember =
    useMemo(
      () =>
        currentUserId
          ? ranking.find(
              (member) =>
                member.userId ===
                currentUserId,
            ) ?? null
          : null,
      [
        ranking,
        currentUserId,
      ],
    );

  const first =
    ranking[0];

  const second =
    ranking[1];

  const third =
    ranking[2];

  const remaining =
    useMemo(
      () =>
        ranking.slice(3),
      [ranking],
    );

  if (isLoading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            color={
              theme.primary
            }
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
      style={
        styles.container
      }
    >
      <RankingHelpModal
        visible={showHelp}
        onClose={() =>
          setShowHelp(false)
        }
      />

      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          activeOpacity={0.75}
          style={
            styles.headerButton
          }
          onPress={() =>
            router.replace(
              "/(main)/tabs/ranking",
            )
          }
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
            styles.headerCenter
          }
        >
          <Text
            style={
              styles.headerTitle
            }
            numberOfLines={1}
          >
            {groupName}
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            {memberCount === 1
              ? "1 membro"
              : `${memberCount} membros`}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={
            styles.headerButton
          }
          onPress={() =>
            setShowHelp(true)
          }
        >
          <Ionicons
            name="help-circle-outline"
            size={21}
            color={
              UI.cyan
            }
          />
        </TouchableOpacity>
      </View>

      {error ? (
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
            style={
              styles.retryButton
            }
            activeOpacity={0.85}
            onPress={() => {
              void carregarRanking();
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
              onRefresh={() => {
                void carregarRanking(
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
        >
          {ranking.length ===
          0 ? (
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
                  size={29}
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
                Ranking vazio
              </Text>

              <Text
                style={
                  styles.stateDescription
                }
              >
                Ainda não existem
                dados para montar a
                classificação.
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
                    Pódio
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Os três destaques
                    do grupo
                  </Text>
                </View>

                <View
                  style={
                    styles.trophyIcon
                  }
                >
                  <Ionicons
                    name="trophy-outline"
                    size={18}
                    color={
                      UI.cyan
                    }
                  />
                </View>
              </View>

              <LinearGradient
                colors={[
                  "#111B2E",
                  "#151B31",
                  "#1C1834",
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
                  styles.podiumCard
                }
              >

                <View
                  style={
                    styles.podiumRow
                  }
                >
                  <View
                    style={
                      styles.podiumSlot
                    }
                  >
                    {second ? (
                      <PodiumMember
                        member={
                          second
                        }
                        place={2}
                      />
                    ) : (
                      <View
                        style={
                          styles.podiumPlaceholder
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.podiumSlot
                    }
                  >
                    {first ? (
                      <PodiumMember
                        member={
                          first
                        }
                        place={1}
                      />
                    ) : (
                      <View
                        style={
                          styles.podiumPlaceholder
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.podiumSlot
                    }
                  >
                    {third ? (
                      <PodiumMember
                        member={
                          third
                        }
                        place={3}
                      />
                    ) : (
                      <View
                        style={
                          styles.podiumPlaceholder
                        }
                      />
                    )}
                  </View>
                </View>
              </LinearGradient>

              {currentMember && (
                <LinearGradient
                  colors={[
                    "#17263F",
                    "#251B44",
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
                    styles.myPositionCard
                  }
                >
                  <MemberAvatar
                    member={
                      currentMember
                    }
                    size={43}
                    borderColor={
                      UI.blue
                    }
                  />

                  <View
                    style={
                      styles.myPositionInfo
                    }
                  >
                    <Text
                      style={
                        styles.myPositionLabel
                      }
                    >
                      SUA POSIÇÃO
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={
                        styles.myPositionName
                      }
                    >
                      {
                        currentMember.name
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.myPositionStats
                    }
                  >
                    <Text
                      style={
                        styles.myPositionPoints
                      }
                    >
                      {formatPoints(
                        currentMember.points,
                      )} pts
                    </Text>

                    <Text
                      style={
                        styles.myPositionRank
                      }
                    >
                      #
                      {
                        currentMember.position
                      }
                    </Text>
                  </View>
                </LinearGradient>
              )}

              {remaining.length >
                0 && (
                <>
                  <View
                    style={[
                      styles.sectionHeader,
                      styles.rankingHeader,
                    ]}
                  >
                    <View>
                      <Text
                        style={
                          styles.sectionTitle
                        }
                      >
                        Classificação
                      </Text>

                      <Text
                        style={
                          styles.sectionSubtitle
                        }
                      >
                        Demais posições
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
                          remaining.length
                        }
                      </Text>
                    </View>
                  </View>

                  <View>
                    {remaining.map(
                      (
                        member,
                      ) => {
                        const isMe =
                          member.userId ===
                          currentUserId;

                        return (
                          <View
                            key={
                              member.userId
                            }
                            style={[
                              styles.rankingItem,

                              isMe &&
                                styles.rankingItemMe,
                            ]}
                          >
                            <View
                              style={[
                                styles.rankNumber,

                                isMe &&
                                  styles.rankNumberMe,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.rankNumberText,

                                  isMe &&
                                    styles.rankNumberTextMe,
                                ]}
                              >
                                #
                                {
                                  member.position
                                }
                              </Text>
                            </View>

                            <MemberAvatar
                              member={
                                member
                              }
                              size={42}
                              borderColor={
                                isMe
                                  ? UI.blue
                                  : undefined
                              }
                            />

                            <View
                              style={
                                styles.rankingInfo
                              }
                            >
                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.rankingName
                                }
                              >
                                {
                                  member.name
                                }
                              </Text>

                              <Text
                                style={
                                  styles.rankingPoints
                                }
                              >
                                {formatPoints(
                                  member.points,
                                )}{" "}
                                pontos
                              </Text>
                            </View>

                            {isMe && (
                              <View
                                style={
                                  styles.youBadge
                                }
                              >
                                <Text
                                  style={
                                    styles.youBadgeText
                                  }
                                >
                                  VOCÊ
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      },
                    )}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
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

    header: {
      minHeight: 68,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 16,
      paddingVertical: 10,

      borderBottomWidth: 1,
      borderBottomColor:
        "rgba(42,52,72,0.55)",
    },

    headerButton: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surface,

      borderWidth: 1,
      borderColor:
        theme.border,
    },

    headerCenter: {
      flex: 1,

      alignItems: "center",

      paddingHorizontal: 8,
    },

    headerTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,
      fontWeight: "800",

      maxWidth: 205,
    },

    headerSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 2,
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 45,
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

      fontSize: 22,
      fontWeight: "800",
    },

    sectionSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 11,

      marginTop: 3,
    },

    trophyIcon: {
      width: 36,
      height: 36,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surface,

      borderWidth: 1,
      borderColor:
        theme.border,
    },

    podiumCard: {
      minHeight: 275,

      borderRadius: 23,

      borderWidth: 1,
      borderColor:
        "#26344D",

      paddingTop: 17,
      paddingHorizontal: 8,

      overflow: "hidden",

      marginBottom: 14,
    },

    podiumRow: {
      flex: 1,

      flexDirection: "row",
      alignItems: "flex-end",
    },

    podiumSlot: {
      flex: 1,

      height: "100%",

      justifyContent: "flex-end",
    },

    podiumPlaceholder: {
      flex: 1,
    },

    podiumMember: {
      flex: 1,

      alignItems: "center",
      justifyContent: "flex-end",
    },

    podiumPerson: {
      alignItems: "center",

      paddingHorizontal: 3,
    },

    leaderIndicator: {
      height: 25,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 8,

      borderRadius: 999,

      backgroundColor:
        "rgba(98,229,244,0.08)",

      borderWidth: 1,
      borderColor:
        "rgba(98,229,244,0.20)",

      marginBottom: 7,
    },

    leaderText: {
      color:
        UI.cyan,

      fontSize: 7,
      fontWeight: "800",

      letterSpacing: 0.7,

      marginLeft: 4,
    },

    firstAvatarRing: {
      padding: 3,

      borderRadius: 50,

      backgroundColor:
        "rgba(98,229,244,0.045)",

      borderWidth: 1,
      borderColor:
        "rgba(98,229,244,0.16)",
    },

    avatarImage: {
      backgroundColor:
        UI.surfaceRaised,
    },

    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#201B3B",
    },

    avatarInitials: {
      color:
        theme.textPrimary,

      fontWeight: "800",
    },

    podiumName: {
      color:
        theme.textPrimary,

      fontSize: 10,
      fontWeight: "700",

      maxWidth: 88,

      textAlign: "center",

      marginTop: 8,
    },

    firstName: {
      color:
        UI.cyan,
    },

    podiumPoints: {
      color:
        theme.textSecondary,

      fontSize: 8,

      marginTop: 4,
      marginBottom: 9,
    },

    podiumBlock: {
      width: "88%",

      borderTopLeftRadius: 13,
      borderTopRightRadius: 13,

      borderWidth: 1,
      borderBottomWidth: 0,

      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000000",
      shadowOpacity: 0.26,
      shadowRadius: 9,

      shadowOffset: {
        width: 0,
        height: -3,
      },

      elevation: 4,
    },

    firstBlock: {
      height: 93,
    },

    secondBlock: {
      height: 68,
    },

    thirdBlock: {
      height: 54,
    },

    podiumPosition: {
      fontSize: 23,
      fontWeight: "900",
    },

    myPositionCard: {
      minHeight: 70,

      flexDirection: "row",
      alignItems: "center",

      borderRadius: 18,

      borderWidth: 1,
      borderColor:
        "rgba(107,140,255,0.20)",

      paddingHorizontal: 13,
      paddingVertical: 11,

      marginBottom: 29,
    },

    myPositionInfo: {
      flex: 1,
      minWidth: 0,

      marginLeft: 10,
    },

    myPositionLabel: {
      color:
        UI.purpleSoft,

      fontSize: 7,
      fontWeight: "800",

      letterSpacing: 1,

      marginBottom: 3,
    },

    myPositionName: {
      color:
        theme.textPrimary,

      fontSize: 13,
      fontWeight: "700",
    },

    myPositionStats: {
      alignItems: "flex-end",

      marginLeft: 10,
    },

    myPositionPoints: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginBottom: 2,
    },

    myPositionRank: {
      color:
        UI.blueSoft,

      fontSize: 20,
      fontWeight: "900",
    },

    rankingHeader: {
      marginTop: 1,
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

    rankingItem: {
      minHeight: 69,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor:
        UI.surface,

      borderRadius: 17,

      borderWidth: 1,
      borderColor:
        theme.border,

      paddingHorizontal: 11,
      paddingVertical: 10,

      marginBottom: 9,
    },

    rankingItemMe: {
      backgroundColor:
        "#172239",

      borderColor:
        "rgba(107,140,255,0.24)",
    },

    rankNumber: {
      width: 38,
      height: 32,

      borderRadius: 10,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surfaceRaised,

      marginRight: 10,
    },

    rankNumberMe: {
      backgroundColor:
        "rgba(107,140,255,0.10)",
    },

    rankNumberText: {
      color:
        theme.textSecondary,

      fontSize: 11,
      fontWeight: "800",
    },

    rankNumberTextMe: {
      color:
        UI.blueSoft,
    },

    rankingInfo: {
      flex: 1,
      minWidth: 0,

      marginLeft: 10,
    },

    rankingName: {
      color:
        theme.textPrimary,

      fontSize: 13,
      fontWeight: "700",
    },

    rankingPoints: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 4,
    },

    youBadge: {
      borderRadius: 999,

      paddingHorizontal: 7,
      paddingVertical: 3,

      backgroundColor:
        "rgba(107,140,255,0.11)",

      borderWidth: 1,
      borderColor:
        "rgba(107,140,255,0.19)",
    },

    youBadgeText: {
      color:
        UI.blueSoft,

      fontSize: 7,
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
      paddingBottom: 75,
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

      paddingHorizontal: 17,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

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