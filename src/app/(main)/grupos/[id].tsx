import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useRouter,
  useLocalSearchParams,
} from "expo-router";

const grupos = {
  g1: {
    nome: "Inateleiros",
    minhaPosicao: 1,
  },

  g2: {
    nome: "Estudos",
    minhaPosicao: 5,
  },

  g3: {
    nome: "Academia",
    minhaPosicao: 7,
  },
};

const rankingPorGrupo = {
  g1: [
    {
      id: "1",
      nome: "Rafael",
      pontos: 1250,
      foto: "https://i.pravatar.cc/150?img=8",
      isMe: true,
    },
    {
      id: "2",
      nome: "Gabriel",
      pontos: 1100,
      foto: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: "3",
      nome: "José",
      pontos: 980,
      foto: "https://i.pravatar.cc/150?img=13",
    },
    {
      id: "4",
      nome: "Lucas",
      pontos: 870,
      foto: "https://i.pravatar.cc/150?img=14",
    },
    {
      id: "5",
      nome: "Ana",
      pontos: 820,
      foto: "https://i.pravatar.cc/150?img=15",
    },
  ],

  g2: [
    {
      id: "2",
      nome: "Gabriel",
      pontos: 1400,
      foto: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: "3",
      nome: "José",
      pontos: 1300,
      foto: "https://i.pravatar.cc/150?img=13",
    },
    {
      id: "5",
      nome: "Ana",
      pontos: 1200,
      foto: "https://i.pravatar.cc/150?img=15",
    },
    {
      id: "4",
      nome: "Lucas",
      pontos: 1100,
      foto: "https://i.pravatar.cc/150?img=14",
    },
    {
      id: "1",
      nome: "Rafael",
      pontos: 980,
      foto: "https://i.pravatar.cc/150?img=8",
      isMe: true,
    },
  ],

  g3: [
    {
      id: "2",
      nome: "Gabriel",
      pontos: 1800,
      foto: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: "3",
      nome: "José",
      pontos: 1700,
      foto: "https://i.pravatar.cc/150?img=13",
    },
    {
      id: "5",
      nome: "Ana",
      pontos: 1600,
      foto: "https://i.pravatar.cc/150?img=15",
    },
    {
      id: "4",
      nome: "Lucas",
      pontos: 1500,
      foto: "https://i.pravatar.cc/150?img=14",
    },
    {
      id: "6",
      nome: "Pedro",
      pontos: 1400,
      foto: "https://i.pravatar.cc/150?img=16",
    },
    {
      id: "7",
      nome: "Carlos",
      pontos: 1300,
      foto: "https://i.pravatar.cc/150?img=17",
    },
    {
      id: "1",
      nome: "Rafael",
      pontos: 1200,
      foto: "https://i.pravatar.cc/150?img=8",
      isMe: true,
    },
  ],
};

export default function RankingGrupoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const grupoAtual =
    grupos[id as keyof typeof grupos] || {
      nome: "Grupo",
      minhaPosicao: 999,
    };

  const rankingData =
    rankingPorGrupo[
      id as keyof typeof rankingPorGrupo
    ] || [];

  const nomeGrupo = grupoAtual.nome;
  const minhaPosicao = grupoAtual.minhaPosicao;

  const isTop3 = minhaPosicao <= 3;

  const cardColor = isTop3
    ? "#1b3320"
    : "#33281b";

  const borderColor = isTop3
    ? "#36693b"
    : "#a66b00";

  const textColor = isTop3
    ? "#7fd48b"
    : "#ffb347";

  const top3 = rankingData.slice(0, 3);
  const restantes = rankingData.slice(3);

  const usuario = rankingData.find(
    (u) => u.isMe
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace("/tabs/ranking")
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.groupTitle}>
            {nomeGrupo}
          </Text>

          <Text style={styles.groupSubtitle}>
            Ranking do Grupo
          </Text>
        </View>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          usuario && styles.scrollWithBottomCard,
        ]}
      >
        {top3.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* SEGUNDO */}
            <View style={styles.podiumItem}>
              <Image
                source={{ uri: top3[1].foto }}
                style={styles.avatar}
              />

              <Text style={styles.podiumName}>
                {top3[1].nome}
              </Text>

              <View
                style={[
                  styles.podiumBlock,
                  {
                    height: 70,
                    backgroundColor: "#6b6b6b",
                  },
                ]}
              >
                <Text style={styles.podiumPlace}>
                  2º
                </Text>
              </View>
            </View>

            {/* PRIMEIRO */}
            <View style={styles.podiumItem}>
              <Ionicons
                name="trophy"
                size={24}
                color="#FFD700"
                style={{ marginBottom: 5 }}
              />

              <Image
                source={{ uri: top3[0].foto }}
                style={styles.firstAvatar}
              />

              <Text style={styles.firstName}>
                {top3[0].nome}
              </Text>

              <View
                style={[
                  styles.podiumBlock,
                  {
                    height: 100,
                    backgroundColor: "#FFD700",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.podiumPlace,
                    { color: "#000" },
                  ]}
                >
                  1º
                </Text>
              </View>
            </View>

            {/* TERCEIRO */}
            <View style={styles.podiumItem}>
              <Image
                source={{ uri: top3[2].foto }}
                style={styles.avatar}
              />

              <Text style={styles.podiumName}>
                {top3[2].nome}
              </Text>

              <View
                style={[
                  styles.podiumBlock,
                  {
                    height: 55,
                    backgroundColor: "#a25d2a",
                  },
                ]}
              >
                <Text style={styles.podiumPlace}>
                  3º
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          {restantes.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.listItem,
                item.isMe && styles.myListItem,
              ]}
            >
              <Text style={styles.position}>
                #{index + 4}
              </Text>

              <Image
                source={{ uri: item.foto }}
                style={styles.listAvatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>
                  {item.nome}
                </Text>

                {item.isMe && (
                  <Text style={styles.youText}>
                    Você
                  </Text>
                )}

                <Text style={styles.listPoints}>
                  {item.pontos} pontos
                </Text>
              </View>

              <Ionicons
                name={
                  item.isMe
                    ? "star"
                    : "chevron-forward"
                }
                size={18}
                color={
                  item.isMe
                    ? "#FFD700"
                    : "#555"
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {usuario && (
        <View
          style={[
            styles.meCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          <Text
            style={[
              styles.meTitle,
              { color: textColor },
            ]}
          >
            Sua colocação
          </Text>

          <View style={styles.meContent}>
            <Image
              source={{ uri: usuario.foto }}
              style={styles.meAvatar}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.meName}>
                {usuario.nome}
              </Text>

              <Text
                style={[
                  styles.mePoints,
                  { color: textColor },
                ]}
              >
                {usuario.pontos} pontos
              </Text>
            </View>

            <Text
              style={[
                styles.mePosition,
                { color: textColor },
              ]}
            >
              #{minhaPosicao}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerSpace: {
    width: 40,
  },

  groupTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  groupSubtitle: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  scrollWithBottomCard: {
    paddingBottom: 150,
  },

  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
  },

  podiumItem: {
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },

  firstAvatar: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 3,
    borderColor: "#FFD700",
    marginBottom: 8,
  },

  podiumName: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 8,
  },

  firstName: {
    color: "#FFD700",
    fontWeight: "700",
    marginBottom: 8,
  },

  podiumBlock: {
    width: 80,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  podiumPlace: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  listContainer: {
    paddingHorizontal: 16,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  myListItem: {
    borderWidth: 1,
    borderColor: "#FFD700",
  },

  position: {
    width: 40,
    color: "#888",
    fontWeight: "700",
  },

  listAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },

  listName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  youText: {
    color: "#FFD700",
    fontSize: 11,
    marginTop: 2,
  },

  listPoints: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },

  meCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },

  meTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  meContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  meAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },

  meName: {
    color: "#fff",
    fontWeight: "600",
  },

  mePoints: {
    fontSize: 12,
  },

  mePosition: {
    fontSize: 24,
    fontWeight: "800",
  },
});
