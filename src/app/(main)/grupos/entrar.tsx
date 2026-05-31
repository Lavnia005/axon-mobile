import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function EntrarGrupoScreen() {
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");

  const handleEntrar = () => {
    // Lógica futura:
    // 1. Busca o grupo pelo código
    // 2. Se o grupo retornado do BD tiver senha, valida o campo 'senha'
    console.log("Tentando entrar:", { codigo, senha });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Entrar em um Grupo</Text>
        <Text style={styles.description}>
          Insira o código do grupo. Se o grupo for privado, você também
          precisará da senha.
        </Text>

        <View style={styles.inputContainer}>
          <View>
            <Text style={styles.label}>Código do Grupo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: AXON-77"
              placeholderTextColor="#444"
              autoCapitalize="characters"
              value={codigo}
              onChangeText={setCodigo}
            />
          </View>

          <View>
            <Text style={styles.label}>Senha (apenas se o grupo exigir)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#333"
              secureTextEntry={true}
              value={senha}
              onChangeText={setSenha}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEntrar}>
          <Text style={styles.buttonText}>Validar e Entrar</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    color: "#007AFF",
    marginBottom: 20,
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#888",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  inputContainer: {
    gap: 20,
    marginBottom: 30,
  },
  label: {
    color: "#666",
    fontSize: 13,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#34C759",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: "auto", // Empurra o botão para o final da tela
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
