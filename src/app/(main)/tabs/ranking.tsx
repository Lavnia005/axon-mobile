import React from "react";

import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Se estiver usando Expo Router, importe o Link ou o useRouter:
import { router } from 'expo-router';

// Dados simulados dos grupos que o usuário participa
const meusGrupos = [
  {
    id: "g1",
    nome: "Inateleiros",
    membros: 6,
    posicaoUsuario: 2,
  },
  {
    id: "g2",
    nome: "Marombeiros",
    membros: 8,
    posicaoUsuario: 5,
  },
  {
    id: "g3",
    nome: "Desafio Leitura",
    membros: 25,
    posicaoUsuario: 1,
  },
];

export default function GruposRankingScreen() { 

  const handlePressGrupo = (id: string) => { // isso seria o ID do grupo selecionado
    // Aqui você navegaria para a tela do pódio que você já criou, passando o ID
    router.push({ pathname: "/tabs/ranking/[id]", params: { id } });
    console.log(`Navegar para o ranking do grupo: ${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meus Rankings</Text>
      <Text style={styles.subtitle}>Selecione um grupo para ver o pódio</Text>

      <FlatList // isso é uma lista que renderiza os grupos do usuário
        data={meusGrupos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity  // cada grupo é um card clicável
            style={styles.groupCard} 
            activeOpacity={0.7}
            onPress={() => handlePressGrupo(item.id)}
          >
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.nome}</Text>
              <Text style={styles.groupMembers}>{item.membros} membros</Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{item.posicaoUsuario}º</Text>
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
    fontSize: 16,
  },
});