import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/start" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/running" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/result" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/detail" options={{ headerShown: false }} />
        <Stack.Screen name="kvkk" options={{ headerShown: false }} />
        <Stack.Screen name="riskmap" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
