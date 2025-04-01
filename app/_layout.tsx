import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { DatabaseProvider } from '../context/DatabaseContext';
import React from 'react';

export default function AppLayout() {
  return (
    <DatabaseProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'briefcase';

            if (route.name === 'index') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'bookmarks') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4a80f5',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Jobs' }} />
        <Tabs.Screen name="bookmarks" options={{ title: 'Bookmarks' }} />

        <Tabs.Screen name="stack/job/[id]" options={{ href: null }} />
      </Tabs>
    </DatabaseProvider>
  );
}
