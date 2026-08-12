import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

// Dados fictícios para visualização, substituir por dados reais posteriormente
const completedGoals = 2;
const totalGoals = 3;
const pct = Math.round((completedGoals / totalGoals) * 100);
const totalPts = 320;

// Para visualização, substituir por dados reais posteriormente
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

// Para visualização, substituir por dados reais posteriormente
const rankings = [
  { id: 1, name: "Inateleiros", pos: 1 },
  { id: 2, name: "Estudos", pos: 5 },
  { id: 3, name: "Academia", pos: 7 },
];

const homeRankings = rankings.slice(0, 6);

const STATUS_COLOR: Record<string, string> = {
  accepted: "#078130",
  disputed: "#c18700",
  pending: "#3a3a3a",
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.root}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TÍTULO ── */}
        <Text style={s.appTitle}>Axon</Text>

        {/* ── CARD PROGRESSO ── */}
        <TouchableOpacity style={s.card} activeOpacity={0.85}>
          <Text style={s.cardTitle}>Progresso</Text>

          <View style={s.progressRow}>
            <View style={s.progressCol}>
              <Text style={s.progressBig}>{pct}%</Text>
              <Text style={s.progressLbl}>concluído</Text>
            </View>

            <View style={s.progressCol}>
              <Text style={s.progressBig}>{totalPts}</Text>
              <Text style={s.progressLbl}>pontos</Text>
            </View>

            <View style={s.progressCol}>
              <Text style={s.progressBig}>
                {completedGoals}/{totalGoals}
              </Text>
              <Text style={s.progressLbl}>tarefas</Text>
            </View>
          </View>

          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${pct}%` }]} />
          </View>
        </TouchableOpacity>

        {/* ── CARD OBJETIVOS ── */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.85}
          onPress={() => router.push("/tabs/objetivos")}
        >
          <Text style={s.cardTitle}>Objetivos do dia</Text>

          <View style={s.goalsList}>
            {homeGoals.map((g, i) => (
              <View key={g.id}>
                <View style={s.goalRow}>
                  <View
                    style={[
                      s.goalDot,
                      { backgroundColor: STATUS_COLOR[g.status] },
                    ]}
                  />

                  <Text style={s.goalTitle} numberOfLines={1}>
                    {g.title}
                  </Text>

                  <Text style={s.goalGroup}>{g.group}</Text>
                </View>

                {i < homeGoals.length - 1 && (
                  <View style={s.rowDivider} />
                )}
              </View>
            ))}
          </View>

          {goals.length > 3 && (
            <Text
              style={{
                color: "#36693b",
                fontSize: 12,
                marginTop: 12,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Ver mais objetivos...
            </Text>
          )}
        </TouchableOpacity>

        {/* ── CARD RANKING ── */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.85}
          onPress={() => router.push("/tabs/ranking")}
        >
          <Text style={s.cardTitle}>Minhas colocações</Text>

          <View style={s.rankRow}>
            { homeRankings.map((r) => (
              <View key={r.id} style={s.rankItem}>
                <Text style={s.rankPos}>{r.pos}°</Text>

                <View style={s.rankLine} />

                <Text style={s.rankName}>{r.name}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD = "#161616";
const BORDER = "#1f1f1f";

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },

  root: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 15,
    gap: 10,
  },

  appTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 2,
  },

  // Cards
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    minHeight: 140,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },

  // Progresso
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  progressCol: {
    alignItems: "center",
    flex: 1,
  },

  progressBig: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  progressLbl: {
    color: "#444",
    fontSize: 10,
    marginTop: 2,
  },

  barBg: {
    height: 4,
    backgroundColor: "#222",
    borderRadius: 2,
    overflow: "hidden",
  },

  barFill: {
    height: 4,
    backgroundColor: "#36693b",
    borderRadius: 2,
  },

  // Objetivos
  goalsList: {
    gap: 6,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },

  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  goalTitle: {
    flex: 1,
    color: "#ccc",
    fontSize: 13,
    fontWeight: "500",
  },

  goalGroup: {
    color: "#555",
    fontSize: 11,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "#1a1a1a",
    marginVertical: 4,
  },

  // Ranking
  rankRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
},

  rankItem: {
  width: "33.33%",
  alignItems: "center",
  gap: 6,
  marginBottom: 16,
},

  rankPos: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },

  rankLine: {
    width: 36,
    height: 3,
    backgroundColor: "#36693b",
    borderRadius: 2,
  },

  rankName: {
    color: "#c0c0c0",
    fontSize: 11,
    fontWeight: "600",
  },
});