import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

import {
  ApiError,
} from "@/services/api";

import {
  profileService,
} from "@/services/profileService";

import {
  ProfileUser,
} from "@/types/profile";

import {
  colors,
} from "@/theme";

const theme =
  colors.dark;

const UI = {
  blue: "#6687FF",
  blueSoft: "#AAB9FF",

  purple: "#8B6CFF",
  purpleSoft: "#C3B5FF",

  cyan: "#66E3F2",

  surface: "#151E30",
  surfaceRaised: "#1A2438",

  muted: "#7F899D",
};

/* =========================================================
   HELPERS
========================================================= */

function formatBirthDate(
  value?: string,
) {
  if (!value) {
    return "Não informado";
  }

  const datePart =
    value.split("T")[0];

  const [
    year,
    month,
    day,
  ] =
    datePart.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatMemberSince(
  value?: string,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  );
}

function getInitials(
  name?: string,
) {
  if (!name) {
    return "AX";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[
      parts.length - 1
    ][0]
  }`.toUpperCase();
}

/* =========================================================
   INFO ROW
========================================================= */

type InfoRowProps = {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

  last?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: InfoRowProps) {
  return (
    <View>
      <View
        style={
          styles.infoRow
        }
      >
        <View
          style={
            styles.infoIcon
          }
        >
          <Ionicons
            name={icon}
            size={18}
            color={
              UI.blueSoft
            }
          />
        </View>

        <View
          style={
            styles.infoContent
          }
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            {label}
          </Text>

          <Text
            style={
              styles.infoValue
            }
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </View>

      {!last && (
        <View
          style={
            styles.infoDivider
          }
        />
      )}
    </View>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function PerfilScreen() {
  const router =
    useRouter();

  const {
    token,
    logout,
  } =
    useAuth();

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileUser | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    showLogoutModal,
    setShowLogoutModal,
  ] =
    useState(false);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const carregarPerfil =
    useCallback(
      async (
        showLoading = true,
      ) => {
        if (!token) {
          setProfile(null);

          setIsLoading(
            false,
          );

          return;
        }

        try {
          if (
            showLoading
          ) {
            setIsLoading(
              true,
            );
          }

          setError("");

          const response =
            await profileService.getProfile(
              token,
            );

          setProfile(
            response.user,
          );
        } catch (error) {
          console.error(
            "Erro ao carregar perfil:",
            error,
          );

          const message =
            error instanceof
            ApiError
              ? error.message
              : "Não foi possível carregar seu perfil.";

          setError(
            message,
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [token],
    );

  useFocusEffect(
    useCallback(() => {
      void carregarPerfil();
    }, [carregarPerfil]),
  );

  async function handleRefresh() {
    try {
      setIsRefreshing(
        true,
      );

      await carregarPerfil(
        false,
      );
    } finally {
      setIsRefreshing(
        false,
      );
    }
  }

  async function handleLogout() {
    setShowLogoutModal(
      false,
    );

    await logout();
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    isLoading &&
    !profile
  ) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <ActivityIndicator
            size="small"
            color={
              UI.purpleSoft
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    !profile
  ) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.centerState
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
              styles.errorTitle
            }
          >
            Não foi possível carregar
          </Text>

          <Text
            style={
              styles.errorDescription
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
            onPress={() =>
              void carregarPerfil()
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
      </SafeAreaView>
    );
  }

  if (!profile) {
    return null;
  }

  const initials =
    getInitials(
      profile.name,
    );

  const memberSince =
    formatMemberSince(
      profile.createdAt,
    );

  /* =======================================================
     CONTENT
  ======================================================= */

  return (
    <SafeAreaView
      style={
        styles.container
      }
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
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={
              UI.purpleSoft
            }
          />
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.pageHeader
          }
        >
          <Text
            style={
              styles.pageTitle
            }
          >
            Perfil
          </Text>

          <Text
            style={
              styles.pageSubtitle
            }
          >
            Sua conta no Axon
          </Text>
        </View>

        {/* PROFILE */}

        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={
              styles.avatarWrapper
            }
          >
            <View
              style={
                styles.avatarBorder
              }
            >
              {profile.profileImage ? (
                <Image
                  source={{
                    uri:
                      profile.profileImage,
                  }}
                  style={
                    styles.avatar
                  }
                />
              ) : (
                <View
                  style={
                    styles.avatarFallback
                  }
                >
                  <Text
                    style={
                      styles.avatarInitials
                    }
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text
            style={
              styles.userName
            }
          >
            {profile.name}
          </Text>

          <Text
            style={
              styles.userEmail
            }
          >
            {profile.email}
          </Text>

          {memberSince && (
            <View
              style={
                styles.memberSinceRow
              }
            >
              <Ionicons
                name="time-outline"
                size={13}
                color={
                  UI.muted
                }
              />

              <Text
                style={
                  styles.memberSinceText
                }
              >
                Membro desde{" "}
                {memberSince}
              </Text>
            </View>
          )}
        </View>

        {/* PERSONAL INFO */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Informações pessoais
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Seus dados cadastrados
          </Text>
        </View>

        <View
          style={
            styles.infoCard
          }
        >
          <InfoRow
            icon="mail-outline"
            label="E-mail"
            value={
              profile.email
            }
          />

          <InfoRow
            icon="call-outline"
            label="Telefone"
            value={
              profile.phone ||
              "Não informado"
            }
          />

          <InfoRow
            icon="calendar-outline"
            label="Data de nascimento"
            value={
              formatBirthDate(
                profile.birthDate,
              )
            }
            last
          />
        </View>

        {/* EDIT PROFILE */}

        <TouchableOpacity
          activeOpacity={
            0.85
          }
          style={
            styles.editCard
          }
          onPress={() =>
            router.push(
              "/perfil/editarPerfil",
            )
          }
        >
          <View
            style={
              styles.actionIcon
            }
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={
                UI.purpleSoft
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
                styles.actionTitle
              }
            >
              Editar perfil
            </Text>

            <Text
              style={
                styles.actionDescription
              }
            >
              Altere seus dados, foto
              e segurança
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={
              UI.muted
            }
          />
        </TouchableOpacity>

        {/* ACCOUNT */}

        <View
          style={[
            styles.sectionHeader,
            styles.accountHeader,
          ]}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Conta
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={
            0.82
          }
          style={
            styles.logoutButton
          }
          onPress={() =>
            setShowLogoutModal(
              true,
            )
          }
        >
          <View
            style={
              styles.logoutIcon
            }
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={
                theme.error
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
                styles.logoutTitle
              }
            >
              Sair da conta
            </Text>

            <Text
              style={
                styles.logoutDescription
              }
            >
              Encerrar sua sessão
              neste dispositivo
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="rgba(239,68,68,0.55)"
          />
        </TouchableOpacity>
      </ScrollView>

      {/* LOGOUT MODAL */}

      <Modal
        transparent
        animationType="fade"
        visible={
          showLogoutModal
        }
        statusBarTranslucent
        onRequestClose={() =>
          setShowLogoutModal(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <Ionicons
                name="log-out-outline"
                size={25}
                color={
                  theme.error
                }
              />
            </View>

            <Text
              style={
                styles.modalTitle
              }
            >
              Sair da conta?
            </Text>

            <Text
              style={
                styles.modalDescription
              }
            >
              Você precisará entrar
              novamente para acessar
              sua conta.
            </Text>

            <View
              style={
                styles.modalActions
              }
            >
              <TouchableOpacity
                activeOpacity={
                  0.85
                }
                style={
                  styles.cancelButton
                }
                onPress={() =>
                  setShowLogoutModal(
                    false,
                  )
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
                activeOpacity={
                  0.85
                }
                style={
                  styles.confirmLogoutButton
                }
                onPress={() =>
                  void handleLogout()
                }
              >
                <Text
                  style={
                    styles.confirmLogoutText
                  }
                >
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      paddingTop: 13,
      paddingBottom: 120,
    },

    /* HEADER */

    pageHeader: {
      marginBottom: 22,
    },

    pageTitle: {
      color:
        theme.textPrimary,

      fontSize: 23,
      fontWeight: "800",

      letterSpacing: -0.4,
    },

    pageSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 12,

      marginTop: 4,
    },

    /* PROFILE */

    profileCard: {
      alignItems: "center",

      paddingVertical: 25,
      paddingHorizontal: 18,

      borderRadius: 24,

      backgroundColor:
        UI.surface,

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.22)",

      marginBottom: 29,
    },

    avatarWrapper: {
      position: "relative",

      marginBottom: 13,
    },

    avatarBorder: {
      width: 104,
      height: 104,

      borderRadius: 52,

      padding: 3,

      backgroundColor:
        "rgba(102,135,255,0.15)",

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.42)",
    },

    avatar: {
      width: "100%",
      height: "100%",

      borderRadius: 49,
    },

    avatarFallback: {
      flex: 1,

      borderRadius: 49,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#202B45",
    },

    avatarInitials: {
      color:
        UI.blueSoft,

      fontSize: 27,

      fontWeight: "900",

      letterSpacing: 1,
    },

    userName: {
      color:
        theme.textPrimary,

      fontSize: 22,

      fontWeight: "800",

      textAlign: "center",
    },

    userEmail: {
      color:
        theme.textSecondary,

      fontSize: 11,

      marginTop: 4,
    },

    memberSinceRow: {
      flexDirection: "row",
      alignItems: "center",

      gap: 4,

      marginTop: 10,
    },

    memberSinceText: {
      color:
        UI.muted,

      fontSize: 9,

      fontWeight: "500",
    },

    /* SECTION */

    sectionHeader: {
      marginBottom: 12,
    },

    sectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 18,

      fontWeight: "800",
    },

    sectionSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 10,

      marginTop: 3,
    },

    /* INFO */

    infoCard: {
      backgroundColor:
        UI.surface,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        theme.border,

      paddingHorizontal: 14,

      marginBottom: 14,
    },

    infoRow: {
      minHeight: 68,

      flexDirection: "row",
      alignItems: "center",
    },

    infoIcon: {
      width: 38,
      height: 38,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(102,135,255,0.08)",

      marginRight: 12,
    },

    infoContent: {
      flex: 1,

      minWidth: 0,
    },

    infoLabel: {
      color:
        UI.muted,

      fontSize: 9,

      fontWeight: "600",

      marginBottom: 4,
    },

    infoValue: {
      color:
        theme.textPrimary,

      fontSize: 13,

      fontWeight: "600",
    },

    infoDivider: {
      height: 1,

      marginLeft: 50,

      backgroundColor:
        "rgba(255,255,255,0.055)",
    },

    /* EDIT */

    editCard: {
      minHeight: 70,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 14,

      backgroundColor:
        "rgba(139,108,255,0.055)",

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.16)",

      borderRadius: 19,

      marginBottom: 30,
    },

    actionIcon: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.10)",

      marginRight: 11,
    },

    actionContent: {
      flex: 1,
    },

    actionTitle: {
      color:
        theme.textPrimary,

      fontSize: 13,

      fontWeight: "700",
    },

    actionDescription: {
      color:
        theme.textSecondary,

      fontSize: 9,

      lineHeight: 14,

      marginTop: 3,
    },

    /* ACCOUNT */

    accountHeader: {
      marginBottom: 11,
    },

    logoutButton: {
      minHeight: 70,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 14,

      borderRadius: 19,

      backgroundColor:
        "rgba(239,68,68,0.035)",

      borderWidth: 1,

      borderColor:
        "rgba(239,68,68,0.14)",
    },

    logoutIcon: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.08)",

      marginRight: 11,
    },

    logoutTitle: {
      color:
        "#FF7B7B",

      fontSize: 13,

      fontWeight: "700",
    },

    logoutDescription: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 3,
    },

    /* STATES */

    centerState: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 30,
    },

    loadingText: {
      color:
        theme.textSecondary,

      fontSize: 12,

      marginTop: 12,
    },

    errorIcon: {
      width: 54,
      height: 54,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.07)",

      marginBottom: 14,
    },

    errorTitle: {
      color:
        theme.textPrimary,

      fontSize: 17,

      fontWeight: "800",
    },

    errorDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 17,

      textAlign: "center",

      marginTop: 6,
    },

    retryButton: {
      flexDirection: "row",
      alignItems: "center",

      gap: 7,

      paddingHorizontal: 17,
      paddingVertical: 11,

      borderRadius: 13,

      backgroundColor:
        theme.primary,

      marginTop: 18,
    },

    retryButtonText: {
      color:
        "#FFFFFF",

      fontSize: 11,

      fontWeight: "700",
    },

    /* MODAL */

    modalOverlay: {
      flex: 1,

      justifyContent: "center",

      paddingHorizontal: 24,

      backgroundColor:
        "rgba(4,7,14,0.78)",
    },

    modalCard: {
      padding: 20,

      borderRadius: 23,

      backgroundColor:
        "#171E2E",

      borderWidth: 1,

      borderColor:
        theme.border,

      alignItems: "center",
    },

    modalIcon: {
      width: 52,
      height: 52,

      borderRadius: 17,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.08)",

      marginBottom: 14,
    },

    modalTitle: {
      color:
        theme.textPrimary,

      fontSize: 18,

      fontWeight: "800",
    },

    modalDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 17,

      textAlign: "center",

      marginTop: 7,
    },

    modalActions: {
      width: "100%",

      flexDirection: "row",

      gap: 10,

      marginTop: 20,
    },

    cancelButton: {
      flex: 1,

      height: 46,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        UI.surfaceRaised,

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    cancelButtonText: {
      color:
        theme.textPrimary,

      fontSize: 12,

      fontWeight: "700",
    },

    confirmLogoutButton: {
      flex: 1,

      height: 46,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(239,68,68,0.14)",

      borderWidth: 1,

      borderColor:
        "rgba(239,68,68,0.25)",
    },

    confirmLogoutText: {
      color:
        "#FF7B7B",

      fontSize: 12,

      fontWeight: "800",
    },
  });