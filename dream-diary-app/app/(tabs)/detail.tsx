import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ImageBackground, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { getDreams, Dream } from '../../dreamService';

const pastelGradient = require('../../assets/images/pastel-bg.png');

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const dreams = await getDreams();
      const found = dreams.find(d => d.id === id);
      setDream(found || null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} color="#6bb6ff" />;
  if (!dream) return (
    <View style={styles.center}><ThemedText>꿈 정보를 찾을 수 없습니다.</ThemedText></View>
  );

  return (
    <ImageBackground source={pastelGradient} style={styles.bg} resizeMode="cover">
      <View style={styles.container}>
        <ThemedText type="title" style={styles.screenTitle}>세부정보</ThemedText>
        <View style={styles.section}>
          <ThemedText type="title" style={styles.title}>{dream.title}</ThemedText>
          <ThemedText style={styles.date}>{dream.date}</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>내용</ThemedText>
          <ThemedText style={styles.content}>{dream.content}</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>태그</ThemedText>
          <View style={styles.tagRow}>
            {dream.tags.length > 0 ? dream.tags.map(tag => (
              <ThemedText key={tag} style={styles.tag}>#{tag}</ThemedText>
            )) : <ThemedText style={styles.noData}>태그 없음</ThemedText>}
          </View>
        </View>
        {dream.imageUrl && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>이미지</ThemedText>
            <Image source={{ uri: dream.imageUrl }} style={styles.image} />
          </View>
        )}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>감정</ThemedText>
          <ThemedText style={styles.aiData}>{dream.emotion || 'AI 감정 분석 정보 없음'}</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>키워드</ThemedText>
          <ThemedText style={styles.aiData}>{dream.keywords ? dream.keywords.join(', ') : 'AI 키워드 없음'}</ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>요약</ThemedText>
          <ThemedText style={styles.aiData}>{dream.summary || 'AI 요약 없음'}</ThemedText>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backBtnText}>뒤로가기</ThemedText>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    color: '#f7a6c7',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 18,
    alignItems: 'center',
  },
  sectionLabel: {
    color: '#b2d8f7',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  aiData: {
    color: '#6bb6ff',
    fontSize: 15,
    textAlign: 'center',
  },
  noData: {
    color: '#b2d8f7',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    color: '#6bb6ff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    color: '#f7a6c7',
    fontSize: 14,
    marginBottom: 12,
  },
  content: {
    color: '#6bb6ff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f0ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#f7a6c7',
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#6bb6ff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 