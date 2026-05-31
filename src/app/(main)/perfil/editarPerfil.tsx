import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditarPerfilScreen() {
  const router = useRouter();

  // Estados para os campos do esboço
  const [nome, setNome] = useState("Rafael Moreira");
  const [email, setEmail] = useState("rafael@inatel.br");
  const [telefone, setTelefone] = useState("(35) 99999-9999");

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SIMPLES */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CAMPOS DE EDIÇÃO - Conforme o desenho no papel */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput 
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#444"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#444"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput 
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholderTextColor="#444"
          />
        </View>

        <TouchableOpacity style={styles.changePasswordRow}>
          <Text style={styles.changePasswordText}>Alterar senha</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>

        {/* BOTÃO SALVAR - No rodapé como no esboço */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            // Aqui entraria a lógica de salvar no banco de dados
            router.back();
          }}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  changePasswordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  changePasswordText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#fff', // Destaque para ação principal
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 40,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});