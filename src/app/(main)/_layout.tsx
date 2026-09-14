import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { Redirect, Slot } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme";

const theme = colors.dark;

export default function MainLayout() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
});