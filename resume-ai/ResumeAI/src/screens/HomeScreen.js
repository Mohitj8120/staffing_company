import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../context/AuthContext';
import { theme } from '../theme';
import ProfilesTab from './ProfilesTab';
import BrowserTab from './BrowserTab';

const Tab = createBottomTabNavigator();

function ProfileIcon({ focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={{ fontSize: 18 }}>📄</Text>
    </View>
  );
}

function BrowserIcon({ focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={{ fontSize: 18 }}>🌐</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthContext();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0d0d14',
          borderBottomWidth: 1,
          borderBottomColor: theme.glassBorder,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: theme.textMain,
          fontWeight: '700',
          fontSize: 20,
        },
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={styles.authBadge}>
              <Text style={styles.authBadgeText}>Connected</Text>
            </View>
          </View>
        ),
        headerLeft: () => (
          <View style={styles.headerLeft}>
            <LinearGradient colors={theme.gradientPrimary} style={styles.headerLogo}>
              <Text style={styles.headerLogoText}>JD</Text>
            </LinearGradient>
          </View>
        ),
        headerTitle: 'Resume AI',
        tabBarStyle: {
          backgroundColor: '#0d0d14',
          borderTopWidth: 1,
          borderTopColor: theme.glassBorder,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Profiles"
        component={ProfilesTab}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
          tabBarLabel: 'Profiles',
        }}
      />
      <Tab.Screen
        name="JD Browser"
        component={BrowserTab}
        options={{
          tabBarIcon: ({ focused }) => <BrowserIcon focused={focused} />,
          tabBarLabel: 'JD Browser',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  headerRight: {
    marginRight: 16,
  },
  authBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  authBadgeText: {
    color: theme.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
});
