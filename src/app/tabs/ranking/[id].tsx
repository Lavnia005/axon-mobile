import { Ionicons } from "@expo/vector-icons"; // Para o botão de voltar
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, router } from "expo-router";
// Mock de dados (No futuro, você buscaria isso via API usando o ID do grupo)
const rankingData = [
  { id: "1", nome: "Rafael", pontos: 1250, foto: "https://i.pravatar.cc/150?img=8" },
  { id: "2", nome: "Gabriel", pontos: 1100, foto: "https://i.pravatar.cc/150?img=12" },
  { id: "3", nome: "José", pontos: 980, foto: "https://i.pravatar.cc/150?img=13" },
  { id: "4", nome: "Lucas", pontos: 870, foto: "https://i.pravatar.cc/150?img=14" },
  { id: "5", nome: "Ana", pontos: 820, foto: "https://i.pravatar.cc/150?img=15" },
];

export default function RankingGrupoScreen() {
  const top3 = rankingData.slice(0, 3);
  const restantes = rankingData.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DINÂMICO */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}
            onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.groupTitle}>Foco nos Estudos</Text> // arrumar dps para ser o nome do grupo dinâmico
          <Text style={styles.weeklyText}>Ranking do grupo</Text>
        </View>
        <View style={{ width: 28 }} /> {/* Equilíbrio visual */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PÓDIO MELHORADO */}
        <View style={styles.podiumSection}>
          {/* 2º Lugar */}
          <View style={styles.podiumItem}>
            <View style={[styles.avatarContainer, { borderColor: "#A5A5A5" }]}>
              <Image source={{ uri: top3[1].foto }} style={styles.avatar} />
              <View style={[styles.badge, { backgroundColor: "#A5A5A5" }]}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
            <Text style={styles.podiumName}>{top3[1].nome}</Text>
            <Text style={styles.podiumPoints}>{top3[1].pontos} pts</Text>
          </View>

          {/* 1º Lugar - Maior destaque */}
          <View style={[styles.podiumItem, { marginTop: -20 }]}>
            <Ionicons name="ribbon" size={30} color="#FFD700" style={{ marginBottom: 5 }} />
            <View style={[styles.avatarContainer, { borderColor: "#FFD700", width: 90, height: 90, borderRadius: 45 }]}>
              <Image source={{ uri: top3[0].foto }} style={[styles.avatar, { width: 80, height: 80, borderRadius: 40 }]} />
              <View style={[styles.badge, { backgroundColor: "#FFD700", width: 28, height: 28, borderRadius: 14 }]}>
                <Text style={[styles.badgeText, { color: "#000" }]}>1</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, { fontSize: 18, color: "#FFD700" }]}>{top3[0].nome}</Text>
            <Text style={[styles.podiumPoints, { fontSize: 14 }]}>{top3[0].pontos} pts</Text>
          </View>

          {/* 3º Lugar */}
          <View style={styles.podiumItem}>
            <View style={[styles.avatarContainer, { borderColor: "#CD7F32" }]}>
              <Image source={{ uri: top3[2].foto }} style={styles.avatar} />
              <View style={[styles.badge, { backgroundColor: "#CD7F32" }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.podiumName}>{top3[2].nome}</Text>
            <Text style={styles.podiumPoints}>{top3[2].pontos} pts</Text>
          </View>
        </View>

        {/* LISTA RESTANTE */}
        <View style={styles.listContainer}>
          {restantes.map((item, index) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.rankNumber}>{index + 4}º</Text>
              <Image source={{ uri: item.foto }} style={styles.listAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{item.nome}</Text>
                <Text style={styles.listPoints}>{item.pontos} pontos acumulados</Text>
              </View>
              <Ionicons name="trending-up" size={20} color="#4CAF50" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  groupTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center" },
  weeklyText: { color: "#666", fontSize: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  podiumSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingVertical: 40,
    backgroundColor: "#111",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  podiumItem: { alignItems: "center", width: "30%" },
  avatarContainer: {
    borderWidth: 3,
    padding: 3,
    borderRadius: 35,
    position: "relative",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  badge: {
    position: "absolute",
    bottom: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  podiumName: { color: "#fff", fontWeight: "600", fontSize: 14, marginTop: 5 },
  podiumPoints: { color: "#888", fontSize: 12 },
  listContainer: { paddingHorizontal: 20 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161616",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
  },
  rankNumber: { color: "#555", fontSize: 16, fontWeight: "bold", width: 35 },
  listAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  listName: { color: "#fff", fontSize: 16, fontWeight: "500" },
  listPoints: { color: "#666", fontSize: 12, marginTop: 2 },
  backButton: { padding: 8 },
});