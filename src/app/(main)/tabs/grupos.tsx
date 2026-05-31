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

// Dados simulados (Mock) - No futuro virão do Banco de Dados
// Se deixar a lista vazia [], o app mostrará apenas as opções de Criar/Entrar
const meusGrupos = [
  {
    id: "1",
    nome: "Inateleiros",
    membros: 6,
    descricao: "Grupo de estudos Inatel",
  },
  {
    id: "2",
    nome: "Marombeiros",
    membros: 8,
    descricao: "Foco no treino e dieta",
  },
];

export default function GruposScreen() {
  // Navega para a tela de descrição/detalhes do grupo (usando o [id].tsx)
  const handleVerDescricao = (id: string) => {
    router.push({ pathname: "/tabs/grupos/[id]", params: { id } });
  };

  // Funções de navegação para as novas telas
  const irParaCriarGrupo = () => router.push("/tabs/grupos/criar");
  const irParaEntrarGrupo = () => router.push("/tabs/grupos/entrar");

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Grupos</Text>
      <Text style={styles.subtitle}>Crie um novo ou entre em um existente</Text>

      {/* Botões de Ação Principal: Criar e Entrar */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={irParaCriarGrupo}
        >
          <Text style={styles.actionButtonText}>+ Criar Grupo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={irParaEntrarGrupo}
        >
          <Text style={styles.actionButtonText}>Entrar em Grupo</Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[styles.subtitle, { alignSelf: "flex-start", marginBottom: 15 }]}
      >
        Seus grupos atuais:
      </Text>

      <FlatList
        data={meusGrupos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Você ainda não faz parte de nenhum grupo.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            activeOpacity={0.7}
            onPress={() => handleVerDescricao(item.id)}
          >
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.nome}</Text>
              <Text style={styles.groupMembers}>{item.membros} membros</Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>Ver</Text>
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
    paddingTop: 20,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 5,
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    alignSelf: "center",
    marginBottom: 30,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 14,
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  secondaryButton: {
    borderColor: "#007AFF", // Um destaque azul para diferenciar "Entrar"
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rankBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyText: {
    color: "#444",
    textAlign: "center",
    marginTop: 20,
  },
});
