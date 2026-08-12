import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

type Tab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
};

const tabs: Tab[] = [
  { label: "Home",      icon: "home-outline",         iconActive: "home",           route: "/tabs/home" },
  { label: "Objetivos", icon: "flag-outline",          iconActive: "flag",           route: "/tabs/objetivos" },
  { label: "Grupos",    icon: "people-outline",        iconActive: "people",         route: "/tabs/grupos" },
  { label: "Ranking",   icon: "trophy-outline",        iconActive: "trophy",         route: "/tabs/ranking" },
  { label: "Perfil",    icon: "person-outline",        iconActive: "person",         route: "/tabs/perfil" },
];

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.route);
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => router.replace(tab.route as any)}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={isActive ? "#fff" : "#444"}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
    paddingBottom: 24, // safe area iOS
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
    position: "relative",
  },
  label: {
    fontSize: 10,
    color: "#444",
    fontWeight: "500",
  },
  labelActive: {
    color: "#fff",
  },
  dot: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
});
