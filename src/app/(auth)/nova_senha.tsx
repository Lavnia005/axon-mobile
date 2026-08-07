import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NovaSenhaScreen() {
  const router = useRouter();

  const handleConfirmar = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Axon</Text>

          <Text style={styles.subtitle}>
            Gestão Inteligente de Estímulos
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua nova senha"
            secureTextEntry
            placeholderTextColor="#888888"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar nova senha"
            secureTextEntry
            placeholderTextColor="#888888"
          />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={handleConfirmar}
          >
            <Text style={styles.buttonText}>
              Confirmar
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  keyboard: {
    flex: 1,
  },

  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 50,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },

  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },

  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

});
