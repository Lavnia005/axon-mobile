// src/app/(main)/_layout.tsx
import { Tabs } from 'expo-router';
import TabBar from '../../../components/tabbar';

export default function MainLayout() {
  return (
    <Tabs 
      tabBar={() => <TabBar />}
      screenOptions={{
        headerShown: false, // Isso remove a barra superior de todas as tabs
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="ranking" />
      {/* ... outras telas */}
    </Tabs>
  );
}