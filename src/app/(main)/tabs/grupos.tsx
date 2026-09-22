import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { groupService } from "@/services/groupService";
import { Group } from "@/types/group";
import { colors } from "@/theme";

const theme = colors.dark;

export default function GruposScreen() {
  const { token } = useAuth();

  const [meusGrupos, setMeusGrupos] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const carregarGrupos = useCallback(
    async (showLoading = true) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }

        setError("");

        const grupos = await groupService.getGroups(token);

        setMeusGrupos(grupos);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Não foi possível carregar seus grupos.");
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
      carregarGrupos();
    }, [carregarGrupos]),
  );

  async function handleRefresh() {
    setIsRefreshing(true);
    await carregarGrupos(false);
  }

  function handleVerDescricao(id: string) {
    router.push({
      pathname: "/grupos/[id]",
      params: { id },
    });
  }

  function irParaCriarGrupo() {
    router.push("/grupos/criar");
  }

  function irParaEntrarGrupo() {
    router.push("/grupos/entrar");
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Grupos</Text>

        <Text style={styles.subtitle}>
          Evolua junto com outras pessoas.
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={irParaCriarGrupo}
          activeOpacity={0.85}
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="add"
              size={19}
              color={theme.textPrimary}
            />
          </View>

          <Text style={styles.primaryButtonText}>
            Criar grupo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={irParaEntrarGrupo}
          activeOpacity={0.8}
        >
          <View style={styles.secondaryIcon}>
            <Ionicons
              name="enter-outline"
              size={18}
              color={theme.secondary}
            />
          </View>

          <Text style={styles.secondaryButtonText}>
            Entrar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Seus grupos
          </Text>

          <Text style={styles.sectionSubtitle}>
            Acompanhe seus grupos e objetivos.
          </Text>
        </View>

        {!isLoading && meusGrupos.length > 0 && (
          <View style={styles.groupCount}>
            <Text style={styles.groupCountText}>
              {meusGrupos.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.feedbackContainer}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text style={styles.feedbackText}>
            Carregando grupos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.feedbackContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={theme.error}
            />
          </View>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => carregarGrupos()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={meusGrupos}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={[
                    `${theme.primary}25`,
                    `${theme.secondary}25`,
                  ]}
                  style={styles.emptyIconGradient}
                >
                  <Ionicons
                    name="people-outline"
                    size={34}
                    color={theme.secondary}
                  />
                </LinearGradient>
              </View>

              <Text style={styles.emptyTitle}>
                Nenhum grupo ainda
              </Text>

              <Text style={styles.emptyText}>
                Crie seu primeiro grupo ou entre em um existente para começar.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.groupCard}
              activeOpacity={0.78}
              onPress={() => handleVerDescricao(item._id)}
            >
              <LinearGradient
                colors={
                  index % 2 === 0
                    ? [theme.secondary, theme.primary]
                    : [theme.primary, theme.secondary]
                }
                style={styles.groupAccent}
              />

              <View style={styles.groupInfo}>
                <Text
                  style={styles.groupName}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <View style={styles.membersRow}>
                  <Ionicons
                    name="people-outline"
                    size={14}
                    color={theme.textSecondary}
                  />

                  <Text style={styles.groupMembers}>
                    {item.members.length}{" "}
                    {item.members.length === 1
                      ? "membro"
                      : "membros"}
                  </Text>
                </View>
              </View>

              <View style={styles.viewButton}>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.secondary}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    color: theme.textPrimary,
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.4,
  },

  subtitle: {
    color: theme.textSecondary,
    fontSize: 14,
  },

  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },


 primaryButton: {
  flex: 1.15,
  minHeight: 54,
  paddingHorizontal: 14,
  borderRadius: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,

  backgroundColor: "#5036A8",

  borderWidth: 1,
  borderColor: "#684FD1",
},
  actionIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    flex: 0.85,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },

  secondaryIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: `${theme.secondary}18`,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sectionTitle: {
    color: theme.textPrimary,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 3,
  },

  sectionSubtitle: {
    color: theme.textSecondary,
    fontSize: 12,
  },

  groupCount: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.secondary}12`,
    borderWidth: 1,
    borderColor: `${theme.secondary}70`,
  },

  groupCountText: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: "700",
  },

  listContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  groupCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },

  groupAccent: {
    width: 4,
    alignSelf: "stretch",
  },

  groupInfo: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  groupName: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  groupMembers: {
    color: theme.textSecondary,
    fontSize: 13,
  },

  viewButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },

  feedbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },

  feedbackText: {
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },

  errorIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
    marginBottom: 14,
  },

  errorText: {
    color: theme.error,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: theme.textPrimary,
    fontWeight: "600",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 60,
  },

  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },

  emptyIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyText: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});