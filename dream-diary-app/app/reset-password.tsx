import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';

const logo = require('../assets/images/icon.png');

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('입력 오류', '이메일을 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('이메일 발송', '비밀번호 재설정 메일이 전송되었습니다. 메일함을 확인해 주세요.');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('오류', error.message || '이메일을 다시 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>비밀번호 재설정</ThemedText>
        <ThemedText style={styles.subtitle}>가입한 이메일로 비밀번호 재설정 메일을 보내드립니다.</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#b2d8f7"
        />
        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
          <ThemedText style={styles.buttonText}>{loading ? '전송 중...' : '메일 보내기'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.replace('/login')}>
          <ThemedText style={styles.linkText}>로그인 화면으로 돌아가기</ThemedText>
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