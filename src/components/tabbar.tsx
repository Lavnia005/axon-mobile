import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  usePathname,
  useRouter,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Tab = {
  label: string;

  icon:
    keyof typeof Ionicons.glyphMap;

  iconActive:
    keyof typeof Ionicons.glyphMap;

  route: string;
};

const tabs: Tab[] = [
  {
    label: "Início",
    icon: "home-outline",
    iconActive: "home",
    route: "/tabs/home",
  },

  {
    label: "Objetivos",
    icon: "flag-outline",
    iconActive: "flag",
    route: "/tabs/objetivos",
  },

  {
    label: "Grupos",
    icon: "people-outline",
    iconActive: "people",
    route: "/tabs/grupos",
  },

  {
    label: "Ranking",
    icon: "trophy-outline",
    iconActive: "trophy",
    route: "/tabs/ranking",
  },

  {
    label: "Perfil",
    icon: "person-outline",
    iconActive: "person",
    route: "/tabs/perfil",
  },
];

const UI = {
  background: "#0B1120",

  border: "#263A67",

  inactiveIcon: "#7062D9",

  activeIcon: "#7DDCFF",

  inactiveText: "#657086",

  activeText: "#EEF4FF",
};

export default function TabBar() {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const insets =
    useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,

        {
          paddingBottom:
            Math.max(
              insets.bottom,
              10,
            ),
        },
      ]}
    >
      {tabs.map(
        (tab) => {
          const isActive =
            pathname.startsWith(
              tab.route,
            );

          return (
            <TouchableOpacity
              key={
                tab.route
              }
              activeOpacity={
                0.75
              }
              accessibilityRole="button"
              accessibilityState={{
                selected:
                  isActive,
              }}
              style={
                styles.tab
              }
              onPress={() =>
                router.replace(
                  tab.route as any,
                )
              }
            >
              <Ionicons
                name={
                  isActive
                    ? tab.iconActive
                    : tab.icon
                }
                size={
                  isActive
                    ? 22
                    : 21
                }
                color={
                  isActive
                    ? UI.activeIcon
                    : UI.inactiveIcon
                }
                style={
                  isActive
                    ? styles.activeIcon
                    : styles.inactiveIcon
                }
              />

              <Text
                style={[
                  styles.label,

                  isActive &&
                    styles.labelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        },
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",

      alignItems: "center",

      paddingTop: 11,
      paddingHorizontal: 8,

      backgroundColor:
        UI.background,

      borderTopWidth: 1.3,

      borderTopColor:
        UI.border,
    },

    tab: {
      flex: 1,

      minHeight: 55,

      alignItems: "center",
      justifyContent: "center",
    },

    inactiveIcon: {
      textShadowColor:
        "rgba(112,98,217,0.65)",

      textShadowOffset: {
        width: 0,
        height: 0,
      },

      textShadowRadius: 4,
    },

    activeIcon: {
      textShadowColor:
        "rgba(125,220,255,0.65)",

      textShadowOffset: {
        width: 0,
        height: 0,
      },

      textShadowRadius: 5,
    },

    label: {
      color:
        UI.inactiveText,

      fontSize: 9,

      fontWeight: "600",

      marginTop: 5,
    },

    labelActive: {
      color:
        UI.activeText,

      fontWeight: "800",
    },
  });