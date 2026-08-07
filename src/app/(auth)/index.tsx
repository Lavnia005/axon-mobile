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

export default function LoginScreen() {
  const router = useRouter();

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
            placeholder="E-mail"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            placeholderTextColor="#888888"
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            activeOpacity={0.7}
            onPress={() => router.push("/esqueceu_senha")}
          >
            <Text style={styles.forgotText}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={() => router.replace("/tabs/home")}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push("/cadastro")}
          >
            <Text style={styles.footerText}>
              Não tem uma conta?{" "}
              <Text style={styles.linkBold}>
                Cadastre-se
              </Text>
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

  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 10,
  },

  forgotText: {
    color: "#666",
    fontSize: 13,
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

  footerLink: {
    marginTop: 30,
  },

  footerText: {
    color: "#666",
    fontSize: 14,
  },

  linkBold: {
    color: "#fff",
    fontWeight: "bold",
  },
});