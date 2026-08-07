import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function PerfilScreen() {
  const router = useRouter();

  const user = {
    nome: "Rafael Moreira",
    email: "rafael@inatel.br",
    telefone: "(35) 99999-9999",
    foto: "https://i.pravatar.cc/150?img=11",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.foto }}
              style={styles.avatar}
            />

            <TouchableOpacity style={styles.cameraIcon}>
              <Ionicons
                name="camera"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {user.nome}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            Infos
          </Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Email:
            </Text>

            <Text style={styles.infoValue}>
              {user.email}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Telefone:
            </Text>

            <Text style={styles.infoValue}>
              {user.telefone}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push("/perfil/editarPerfil")
            }
          >
            <Text style={styles.editButtonText}>
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>
            Sair da conta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#333",
  },

  cameraIcon: {
    position: "absolute",
    right: 0,
    bottom: 5,
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 20,
  },

  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  infoBox: {
    backgroundColor: "#111",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#222",
  },

  infoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },

  infoItem: {
    marginBottom: 15,
  },

  infoLabel: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },

  infoValue: {
    color: "#fff",
    fontSize: 16,
  },

  editButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  logoutButton: {
    marginTop: 40,
  },

  logoutText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "500",
  },
});