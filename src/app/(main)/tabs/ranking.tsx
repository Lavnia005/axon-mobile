import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

// Dados simulados dos grupos que o usuário participa
const meusGrupos = [
  {
    id: "g1",
    nome: "Inateleiros",
    membros: 6,
    posicaoUsuario: 1,
  },
  {
    id: "g2",
    nome: "Estudos",
    membros: 8,
    posicaoUsuario: 5,
  },
  {
    id: "g3",
    nome: "Academia",
    membros: 8,
    posicaoUsuario: 7,
  },
];

export default function GruposRankingScreen() {
  const handlePressGrupo = (id: string) => {
    router.push({
    pathname: "/ranking/[id]",
    params: { id },
  });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meus Rankings</Text>
      <Text style={styles.subtitle}>
        Selecione um grupo para ver o pódio
      </Text>

      <FlatList
        data={meusGrupos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            activeOpacity={0.7}
            onPress={() => handlePressGrupo(item.id)}
          >
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.nome}</Text>
              <Text style={styles.groupMembers}>
                {item.membros} membros
              </Text>
            </View>

            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>
                {item.posicaoUsuario}º
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },

  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 5,
  },

  subtitle: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },

  listContent: {
    paddingBottom: 10,
  },

  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",

    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
  },

  groupInfo: {
    flex: 1,
  },

  groupName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  groupMembers: {
    color: "#666",
    fontSize: 14,
  },

  rankBadge: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: "center",
  },

  rankBadgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});