import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

export default function DetalhesGrupoScreen() {
  // Ajuste aqui: forçamos o id a ser tratado como string para acabar com o erro
  const { id } = useLocalSearchParams<{ id: string }>();

  const detalhesSimulados = {
    nome: "Inateleiros",
    descricao:
      "Grupo focado em bater as metas de estudo das disciplinas de Computação do Inatel. Aqui compartilhamos progresso e mantemos a disciplina.",
    membros: 6,
    criador: "Lavínia Andrade",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>← Voltar para Grupos</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{detalhesSimulados.nome}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {detalhesSimulados.membros} Membros
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            {detalhesSimulados.descricao}
          </Text>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navCard}
            onPress={() =>
              // Agora o 'id' aqui embaixo será aceito sem erro vermelho
              router.push({
                pathname: "/tabs/ranking/[id]",
                params: { id: String(id) },
              })
            }
          >
            <View>
              <Text style={styles.navTitle}>🏆 Ranking do Grupo</Text>
              <Text style={styles.navSubtitle}>
                Veja quem está liderando o pódio
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { borderColor: "#34C759" }]}
            onPress={() => router.push("/tabs/objetivos")}
          >
            <View>
              <Text style={styles.navTitle}>🎯 Objetivos</Text>
              <Text style={styles.navSubtitle}>Metas e focos deste grupo</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Criado por: {detalhesSimulados.criador}
          </Text>
          <Text style={styles.footerText}>ID: {id}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  backButtonContainer: {
    paddingVertical: 10,
  },
  backButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    flex: 1,
  },
  badge: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  badgeText: {
    color: "#888",
    fontSize: 12,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#444",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  descriptionText: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 24,
  },
  navigationContainer: {
    gap: 15,
  },
  navCard: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  navSubtitle: {
    color: "#666",
    fontSize: 13,
  },
  arrow: {
    color: "#444",
    fontSize: 24,
  },
  footerInfo: {
    marginTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#222",
    fontSize: 12,
    marginBottom: 5,
  },
});
