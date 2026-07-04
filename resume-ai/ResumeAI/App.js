import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import { theme } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import OverlayScreen from './src/screens/OverlayScreen';
import Toast from './src/components/Toast';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

function AppNavigator({ isOverlayLaunch }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.secondary} />
        <Text style={styles.loadingText}>Loading Session...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={!isAuthenticated ? "Login" : (isOverlayLaunch ? "Overlay" : "Home")}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d0d14',
        },
        headerTintColor: theme.textMain,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: theme.bgDark,
        },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Generate"
            component={GenerateScreen}
            options={{
              title: 'Generate Resume ✨',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="Overlay"
            component={OverlayScreen}
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'fade',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App(props) {
  const isOverlayLaunch = props?.isOverlayLaunch === true || props?.isOverlayLaunch === "true";
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator isOverlayLaunch={isOverlayLaunch} />
          <Toast />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bgDark,
    gap: 16,
  },
  loadingText: {
    color: theme.textMain,
    fontSize: 18,
    fontWeight: '600',
  },
});
