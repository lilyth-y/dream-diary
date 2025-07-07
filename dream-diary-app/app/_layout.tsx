import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Cafe24Ssurround: require('../assets/fonts/Cafe24Ssurround.ttf'), // 폰트 파일 추가 전까지 주석 처리
  });
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  // 웹 환경에서 GumiRomanceTTF 폰트 글로벌 적용
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!document.getElementById('gumi-font')) {
        const style = document.createElement('style');
        style.id = 'gumi-font';
        style.innerHTML = `
          @font-face {
            font-family: 'GumiRomanceTTF';
            src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/2410-1@1.0/GumiRomanceTTF.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          body, html, #root {
            font-family: 'GumiRomanceTTF', sans-serif;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
