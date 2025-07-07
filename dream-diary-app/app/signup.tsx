import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';

const logo = require('../assets/images/icon.png');

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleSignup = async () => {
    if (!email || !password || !password2) {
      Alert.alert('입력 오류', '모든 항목을 입력하세요.');
      return;
    }
    if (password !== password2) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('회원가입 완료', '이메일로 로그인해 주세요.');
      router.replace('/login');
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      Alert.alert('회원가입 실패', error.message || '이미 가입된 이메일이거나, 비밀번호가 약합니다.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6 && /[^a-zA-Z0-9]/.test(password);
  const isPasswordMatch = password === password2;
  const canSubmit = isEmailValid && isPasswordValid && isPasswordMatch && !loading;

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>회원가입</ThemedText>
        <ThemedText style={styles.subtitle}>이메일과 비밀번호로 새로운 계정을 만드세요.</ThemedText>
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
        <ThemedText style={{ color: '#f7a6c7', fontSize: 13, marginBottom: 8 }}>
          비밀번호는 6자 이상, 특수문자를 반드시 포함해야 합니다.
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          value={password2}
          onChangeText={setPassword2}
          secureTextEntry
          placeholderTextColor="#b2d8f7"
        />
        {!isPasswordMatch && password2.length > 0 && (
          <ThemedText style={{ color: '#f7a6c7', fontSize: 13, marginBottom: 8 }}>
            비밀번호가 일치하지 않습니다.
          </ThemedText>
        )}
        <TouchableOpacity style={[styles.button, !canSubmit && { backgroundColor: '#b2d8f7' }]}
          onPress={handleSignup} disabled={!canSubmit}>
          <ThemedText style={styles.buttonText}>{loading ? '가입 중...' : '회원가입'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.replace('/login')}>
          <ThemedText style={styles.linkText}>이미 계정이 있으신가요? 로그인</ThemedText>
        </TouchableOpacity>
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
  linkBtn: {
    marginTop: 18,
  },
  linkText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 