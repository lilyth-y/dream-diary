import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithEmailAndPassword, User } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

const logo = require('../assets/images/icon.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const auth = getAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '375198590369-pgo7675ej3sn61h0tjkt9997v29nhd09.apps.googleusercontent.com',
    redirectUri: 'http://localhost:8082'
  });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => router.replace('/(tabs)'));
    }
  }, [response]);

  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>Dream Diary</ThemedText>
        <ThemedText style={styles.subtitle}>꿈을 기록하고, AI와 함께 분석해보세요!</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#b2d8f7"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#b2d8f7"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <ThemedText style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</ThemedText>
        </TouchableOpacity>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <ThemedText style={styles.dividerText}>또는</ThemedText>
          <View style={styles.divider} />
        </View>
        <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync({ showInRecents: true })}>
          <Image source={require('../assets/images/partial-react-logo.png')} style={styles.googleIcon} />
          <ThemedText style={styles.googleButtonText}>구글로 로그인</ThemedText>
        </TouchableOpacity>
        <View style={styles.bottomRow}>
          <TouchableOpacity onPress={() => router.replace('/signup')}> 
            <ThemedText style={styles.linkText}>회원가입</ThemedText>
          </TouchableOpacity>
          <ThemedText style={{ color: '#b2d8f7', marginHorizontal: 8 }}>|</ThemedText>
          <TouchableOpacity onPress={() => router.replace('/reset-password')}> 
            <ThemedText style={styles.linkText}>비밀번호 재설정</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(240,245,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
    color: '#6bb6ff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#b2d8f7',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f7faff',
    marginBottom: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#6bb6ff',
    borderWidth: 1,
    borderColor: '#b2d8f7',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#6bb6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e3f0ff',
  },
  dividerText: {
    color: '#b2d8f7',
    marginHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#6bb6ff',
    flexDirection: 'row',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 6,
  },
  googleButtonText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  linkText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 