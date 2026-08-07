import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ===============================
// DADOS MOCKADOS
// ===============================

const completedGoals = 2;
const totalGoals = 3;
const pct = Math.round((completedGoals / totalGoals) * 100);

const totalPts = 320;

const goals = [
  {
    id: 1,
    title: "Fazer questões de física",
    group: "Focados",
    status: "accepted",
  },
  {
    id: 2,
    title: "Sem redes sociais manhã",
    group: "Inateleiros",
    status: "disputed",
  },
  {
    id: 3,
    title: "Fazer exercício físico",
    group: "Inateleiros",
    status: "pending",
  },
  {
    id: 4,
    title: "Fazer exercício físico",
    group: "Inateleiros",
    status: "pending",
  },
];

const homeGoals = goals.slice(0, 3);

const rankings = [
  {
    id: 1,
    name: "Inateleiros",
    pos: 1,
  },
  {
    id: 2,
    name: "Estudos",
    pos: 5,
  },
  {
    id: 3,
    name: "Academia",
    pos: 7,
  },
];

const homeRankings = rankings.slice(0, 6);

const STATUS_COLOR: Record<string, string> = {
  accepted: "#078130",
  disputed: "#c18700",
  pending: "#3a3a3a",
};

// ===============================
// TELA HOME
// ===============================

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.root}
      >
        {/* ===============================
            TÍTULO
        =============================== */}

        <Text style={styles.appTitle}>
          Axon
        </Text>

        {/* ===============================
            CARD PROGRESSO
        =============================== */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
        >
          <Text style={styles.cardTitle}>
            Progresso
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.progressCol}>
              <Text style={styles.progressBig}>
                {pct}%
              </Text>

              <Text style={styles.progressLbl}>
                concluído
              </Text>
            </View>

            <View style={styles.progressCol}>
              <Text style={styles.progressBig}>
                {totalPts}
              </Text>

              <Text style={styles.progressLbl}>
                pontos
              </Text>
            </View>

            <View style={styles.progressCol}>
              <Text style={styles.progressBig}>
                {completedGoals}/{totalGoals}
              </Text>

              <Text style={styles.progressLbl}>
                tarefas
              </Text>
            </View>
          </View>

          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${pct}%`,
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* ===============================
            CARD OBJETIVOS
        =============================== */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            router.push("/tabs/objetivos")
          }
        >
          <Text style={styles.cardTitle}>
            Objetivos do dia
          </Text>

          <View style={styles.goalsList}>
            {homeGoals.map((goal, index) => (
              <View key={goal.id}>
                <View style={styles.goalRow}>
                  <View
                    style={[
                      styles.goalDot,
                      {
                        backgroundColor:
                          STATUS_COLOR[goal.status],
                      },
                    ]}
                  />

                  <Text
                    style={styles.goalTitle}
                    numberOfLines={1}
                  >
                    {goal.title}
                  </Text>

                  <Text style={styles.goalGroup}>
                    {goal.group}
                  </Text>
                </View>

                {index <
                  homeGoals.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            ))}
          </View>

          {goals.length > 3 && (
            <Text style={styles.moreText}>
              Ver mais objetivos...
            </Text>
          )}
        </TouchableOpacity>

        {/* ===============================
            CARD RANKING
        =============================== */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            router.push("/tabs/ranking")
          }
        >
          <Text style={styles.cardTitle}>
            Minhas colocações
          </Text>

          <View style={styles.rankRow}>
            {homeRankings.map((ranking) => (
              <View
                key={ranking.id}
                style={styles.rankItem}
              >
                <Text style={styles.rankPos}>
                  {ranking.pos}º
                </Text>

                <View style={styles.rankLine} />

                <Text style={styles.rankName}>
                  {ranking.name}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===============================
// ESTILOS
// ===============================

const CARD = "#161616";
const BORDER = "#1f1f1f";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },

  root: {
    paddingHorizontal: 20,

    // Ajuste da margem superior
    paddingTop: 10,

    paddingBottom: 30,

    gap: 18,
  },

  appTitle: {
    color: "#fff",

    fontSize: 32,
    fontWeight: "800",

    letterSpacing: 1,

    textAlign: "center",

    marginBottom: 5,
  },

  // ===============================
  // CARDS
  // ===============================

  card: {
    backgroundColor: CARD,

    borderRadius: 20,

    borderWidth: 1,
    borderColor: BORDER,

    padding: 20,

    minHeight: 140,
  },

  cardTitle: {
    color: "#fff",

    fontSize: 20,
    fontWeight: "700",

    marginBottom: 20,
  },

  // ===============================
  // PROGRESSO
  // ===============================

  progressRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 20,
  },

  progressCol: {
    alignItems: "center",

    flex: 1,
  },

  progressBig: {
    color: "#fff",

    fontSize: 28,

    fontWeight: "800",
  },

  progressLbl: {
    color: "#aaa",

    fontSize: 13,

    marginTop: 4,
  },

  barBg: {
    height: 6,

    backgroundColor: "#222",

    borderRadius: 3,

    overflow: "hidden",
  },

  barFill: {
    height: 6,

    backgroundColor: "#36693b",

    borderRadius: 3,
  },

  // ===============================
  // OBJETIVOS
  // ===============================

  goalsList: {
    gap: 6,
  },

  goalRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 10,

    paddingVertical: 7,
  },

  goalDot: {
    width: 9,
    height: 9,

    borderRadius: 5,
  },

  goalTitle: {
    flex: 1,

    color: "#ccc",

    fontSize: 15,

    fontWeight: "500",
  },

  goalGroup: {
    color: "#aaa",

    fontSize: 13,
  },

  rowDivider: {
    height: 1,

    backgroundColor: "#1a1a1a",

    marginVertical: 4,
  },

  moreText: {
    color: "#7fd48b",

    fontSize: 14,

    marginTop: 15,

    textAlign: "center",

    fontWeight: "600",
  },

  // ===============================
  // RANKING
  // ===============================

  rankRow: {
    flexDirection: "row",

    flexWrap: "wrap",

    marginTop: 5,
  },

  rankItem: {
    width: "33.33%",

    alignItems: "center",

    gap: 7,

    marginBottom: 10,
  },

  rankPos: {
    color: "#fff",

    fontSize: 32,

    fontWeight: "800",
  },

  rankLine: {
    width: 36,

    height: 4,

    backgroundColor: "#36693b",

    borderRadius: 2,
  },

  rankName: {
    color: "#c0c0c0",

    fontSize: 13,

    fontWeight: "600",

    textAlign: "center",
  },
});