import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 22 }}>{icon}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 0,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: () => <TabIcon icon="🏠" /> }} />
      <Tabs.Screen name="finance" options={{ title: 'Финансы', tabBarIcon: () => <TabIcon icon="💰" /> }} />
      <Tabs.Screen name="goals" options={{ title: 'Цели', tabBarIcon: () => <TabIcon icon="🎯" /> }} />
      <Tabs.Screen name="ideas" options={{ title: 'Идеи', tabBarIcon: () => <TabIcon icon="💡" /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Аналитика', tabBarIcon: () => <TabIcon icon="📊" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: () => <TabIcon icon="👤" /> }} />
    </Tabs>
  );
}