import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function CriarGrupoScreen() {
  // Criando estados para cada funcionalidade que você listou
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [permissoes, setPermissoes] = useState("");
  const [senha, setSenha] = useState("");
  const [qtdMaxima, setQtdMaxima] = useState("");

  const handleCriar = () => {
    // Aqui no futuro você enviará esses dados para o BD
    console.log({
      nome,
      descricao,
      permissoes,
      senha,
      qtdMaxima,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Novo Grupo</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Time de Estudos"
            placeholderTextColor="#444"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Sobre o que é este grupo?"
            placeholderTextColor="#444"
            value={descricao}
            onChangeText={setDescricao}
          />

          <Text style={styles.label}>Permissões</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Admin..."
            placeholderTextColor="#444"
            value={permissoes}
            onChangeText={setPermissoes}
          />

          <Text style={styles.label}>Senha (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Defina uma senha"
            placeholderTextColor="#444"
            secureTextEntry // Esconde os caracteres da senha
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.label}>Quantidade máxima</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 10"
            placeholderTextColor="#444"
            keyboardType="numeric" // Abre o teclado numérico
            value={qtdMaxima}
            onChangeText={setQtdMaxima}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCriar}>
          <Text style={styles.buttonText}>Confirmar Criação</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  backButton: {
    color: "#007AFF",
    marginVertical: 15,
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    gap: 10, // Espaçamento entre os blocos de input
  },
  label: {
    color: "#888",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
