import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeSimples() {
  const router = useRouter();

  // Lista simples de navegação baseada nos seus arquivos atuais
  const paginas = [
    { nome: 'Ir para Objetivos', rota: '/tabs/objetivos' },
    { nome: 'Ir para Rankings', rota: '/tabs/ranking' },
    { nome: 'Ir para Perfil', rota: '/tabs/perfil' },
    { nome: 'Ir para Cadastro', rota: '/cadastro' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Menu de Navegação</Text>
      
      {paginas.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.botao} 
          onPress={() => router.push(item.rota as any)}
        >
          <Text style={styles.textoBotao}>{item.nome}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});