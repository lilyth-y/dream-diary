import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ImageBackground } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { getDreams, Dream } from '../../dreamService';
import { getEmbedding } from '../../openaiService';

const pastelGradient = require('../../assets/images/pastel-bg.png');

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

export default function DejavuScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Dream[]>([]);
  const [allDreams, setAllDreams] = useState<Dream[]>([]);

  // 꿈 일기 전체 불러오기(최초 1회)
  React.useEffect(() => {
    (async () => {
      const dreams = await getDreams();
      setAllDreams(dreams.filter(d => d.embedding));
    })();
  }, []);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const inputEmbedding = await getEmbedding(input.trim());
      // 유사도 계산
      const scored = allDreams
        .map(dream => ({
          ...dream,
          similarity: dream.embedding ? cosineSimilarity(inputEmbedding, dream.embedding) : 0,
        }))
        .filter(d => d.similarity > 0.3) // 임계값(조정 가능)
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
        .slice(0, 5); // 상위 5개
      setResults(scored);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Dream & { similarity?: number } }) => (
    <View style={styles.dreamItem}>
      <ThemedText type="subtitle" style={styles.dreamTitle}>{item.title}</ThemedText>
      <ThemedText type="default" style={styles.dreamDate}>{item.date}</ThemedText>
      <View style={styles.tagContainer}>
        {item.tags.filter(Boolean).map((tag: string) => (
          <View key={String(tag)} style={styles.tag}>
            <ThemedText type="default" style={styles.tagText}>#{String(tag)}</ThemedText>
          </View>
        ))}
      </View>
      <ThemedText style={styles.similarity}>유사도: {(item.similarity! * 100).toFixed(1)}%</ThemedText>
    </View>
  );

  return (
    <ImageBackground source={pastelGradient} style={styles.bg} resizeMode="cover">
      <View style={styles.container}>
        <ThemedText type="title">데자뷰 검색</ThemedText>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="현실에서 느낀 데자뷰 내용을 입력하세요"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#b2d8f7"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            <Ionicons name="sparkles" size={28} color="#6bb6ff" />
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator color="#6bb6ff" style={{ marginTop: 16 }} />}
        {results.length > 0 && !loading && (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => item.id ? String(item.id) : ''}
            style={{ marginTop: 16 }}
          />
        )}
        {!loading && results.length === 0 && input.trim() && (
          <ThemedText style={{ color: '#b2d8f7', marginTop: 32, textAlign: 'center' }}>
            유사한 꿈 일기가 없습니다.
          </ThemedText>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    margin: 16,
    padding: 20,
    alignItems: 'stretch',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#e3f0ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#6bb6ff',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  searchBtn: {
    marginLeft: 4,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
  },
  dreamItem: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#e3e8ff',
  },
  dreamTitle: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dreamDate: {
    color: '#f7a6c7',
    fontSize: 14,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 6,
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
    shadowColor: '#f7a6c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  tagText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  similarity: {
    color: '#b2d8f7',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
}); 