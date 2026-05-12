import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const handleConfirmar = () => {
    router.replace('/'); 
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Axon</Text>
        <Text style={styles.subtitle}>Gestão Inteligente de Estímulos</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua nova senha"
          secureTextEntry={true}
          placeholderTextColor="#888888"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nova senha"
          secureTextEntry={true}
          placeholderTextColor="#888888"
        />

        <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.7}
            onPress={handleConfirmar}
        >
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
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
