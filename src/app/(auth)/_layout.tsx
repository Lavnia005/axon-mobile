import { Stack } from 'expo-router';
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

// Este layout é para as telas de autenticação (login, cadastro, etc)
// Ele não tem um tab bar, e pode ter um design diferente do layout principal