import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6bb6ff',
        tabBarInactiveTintColor: '#a0bcd5',
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          minHeight: 48,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 1,
          borderTopColor: '#e3f0ff',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#b2d8f7',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarShowLabel: true,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarAccessibilityLabel: '하단 탭바',
        tabBarAllowFontScaling: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '꿈 일기',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'book' : 'book-outline'} 
              size={26} 
              color={color} 
              style={focused ? { textShadowColor: '#f7a6c7', textShadowRadius: 4 } : { opacity: 0.8 }}
              accessibilityLabel="꿈 일기 탭"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="write"
        options={{
          title: '작성',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={34} 
              color={color} 
              style={focused ? { textShadowColor: '#6bb6ff', textShadowRadius: 6 } : { opacity: 0.85 }}
              accessibilityLabel="꿈 작성 탭"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dejavu"
        options={{
          title: '데자뷰',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'sparkles' : 'sparkles-outline'} 
              size={26} 
              color={color} 
              style={focused ? { textShadowColor: '#f7a6c7', textShadowRadius: 4 } : { opacity: 0.8 }}
              accessibilityLabel="데자뷰 탭"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '통계',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'analytics' : 'analytics-outline'} 
              size={26} 
              color={color} 
              style={focused ? { textShadowColor: '#6bb6ff', textShadowRadius: 4 } : { opacity: 0.8 }}
              accessibilityLabel="통계 탭"
            />
          ),
        }}
      />
    </Tabs>
  );
}
