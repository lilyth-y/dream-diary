import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { getDreamStats } from '../../dreamService';
import LoadingScreen from '../../components/LoadingScreen';
import { LinearGradient } from 'expo-linear-gradient';

interface DreamStats {
  totalDreams: number;
  emotionStats: Record<string, number>;
  tagStats: Record<string, number>;
  monthlyStats: Record<string, number>;
  recentDreams: any[];
}

export default function ExploreScreen() {
  const [stats, setStats] = useState<DreamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'emotions' | 'tags' | 'timeline'>('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dreamStats = await getDreamStats();
      setStats(dreamStats);
    } catch (error) {
      Alert.alert('오류', '통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="통계를 불러오는 중..." />;
  }

  if (!stats || stats.totalDreams === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Ionicons name="cloud-outline" size={80} color="#b2d8f7" style={{ marginBottom: 24 }} />
        <ThemedText type="title" style={{ textAlign: 'center', color: '#6bb6ff', marginBottom: 12 }}>
          아직 꿈 일기가 없어요
        </ThemedText>
        <ThemedText style={{ color: '#b2d8f7', marginBottom: 24, textAlign: 'center', fontSize: 16 }}>
          꿈을 기록하면 나만의 감정, 태그, 추억 통계를 볼 수 있어요!{"\n"}오늘 밤의 꿈을 남겨보세요.
        </ThemedText>
        <TouchableOpacity
          style={{ backgroundColor: '#f7a6c7', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 36, marginTop: 8 }}
          onPress={() => {
            // 탭 이동: 작성 화면으로 이동
            // navigation이 없으면 router.push('/(tabs)/write') 등으로 대체
            if (typeof window !== 'undefined') {
              window.location.hash = '#/write';
            }
          }}
        >
          <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>꿈 기록하러 가기</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const topEmotions = Object.entries(stats.emotionStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topTags = Object.entries(stats.tagStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statCard}>
        <LinearGradient colors={['#6bb6ff', '#f7a6c7']} style={styles.gradientCard}>
          <Ionicons name="book-outline" size={40} color="#fff" />
          <ThemedText style={styles.statNumber}>{stats.totalDreams}</ThemedText>
          <ThemedText style={styles.statLabel}>총 꿈 개수</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Ionicons name="calendar-outline" size={24} color="#6bb6ff" />
          <ThemedText style={styles.quickStatText}>
            {Object.keys(stats.monthlyStats).length}개월
          </ThemedText>
        </View>
        <View style={styles.quickStatItem}>
          <Ionicons name="heart-outline" size={24} color="#f7a6c7" />
          <ThemedText style={styles.quickStatText}>
            {Object.keys(stats.emotionStats).length}가지 감정
          </ThemedText>
        </View>
        <View style={styles.quickStatItem}>
          <Ionicons name="pricetag-outline" size={24} color="#6bb6ff" />
          <ThemedText style={styles.quickStatText}>
            {Object.keys(stats.tagStats).length}개 태그
          </ThemedText>
        </View>
      </View>

      <View style={styles.recentSection}>
        <ThemedText type="title" style={styles.sectionTitle}>최근 꿈들</ThemedText>
        {stats.recentDreams.slice(0, 3).map((dream, index) => (
          <View key={dream.id} style={styles.recentDreamItem}>
            <View style={styles.recentDreamInfo}>
              <ThemedText style={styles.recentDreamTitle}>{dream.title}</ThemedText>
              <ThemedText style={styles.recentDreamDate}>{dream.date}</ThemedText>
            </View>
            {dream.emotion && (
              <View style={styles.emotionBadge}>
                <ThemedText style={styles.emotionText}>{dream.emotion}</ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderEmotions = () => (
    <View style={styles.tabContent}>
      <ThemedText type="title" style={styles.sectionTitle}>감정 분석</ThemedText>
      {topEmotions.map(([emotion, count], index) => (
        <View key={emotion} style={styles.emotionItem}>
          <View style={styles.emotionHeader}>
            <ThemedText style={styles.emotionName}>{emotion}</ThemedText>
            <ThemedText style={styles.emotionCount}>{count}회</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(count / stats.totalDreams) * 100}%`,
                  backgroundColor: index % 2 === 0 ? '#6bb6ff' : '#f7a6c7'
                }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderTags = () => (
    <View style={styles.tabContent}>
      <ThemedText type="title" style={styles.sectionTitle}>인기 태그</ThemedText>
      <View style={styles.tagGrid}>
        {topTags.map(([tag, count], index) => (
          <View key={tag} style={styles.tagCard}>
            <ThemedText style={styles.tagName}>#{tag}</ThemedText>
            <ThemedText style={styles.tagCount}>{count}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.tabContent}>
      <ThemedText type="title" style={styles.sectionTitle}>월별 기록</ThemedText>
      {Object.entries(stats.monthlyStats)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 6)
        .map(([month, count], index) => (
          <View key={month} style={styles.timelineItem}>
            <View style={styles.timelineHeader}>
              <ThemedText style={styles.timelineMonth}>{month}</ThemedText>
              <ThemedText style={styles.timelineCount}>{count}개</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(count / Math.max(...Object.values(stats.monthlyStats))) * 100}%`,
                    backgroundColor: '#f7a6c7'
                  }
                ]} 
              />
            </View>
          </View>
        ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>꿈 통계</ThemedText>
      
      {/* 탭 네비게이션 */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: '개요', icon: 'home' },
          { key: 'emotions', label: '감정', icon: 'heart' },
          { key: 'tags', label: '태그', icon: 'pricetag' },
          { key: 'timeline', label: '타임라인', icon: 'calendar' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? '#fff' : '#6bb6ff'} 
            />
            <ThemedText style={[
              styles.tabLabel,
              selectedTab === tab.key && styles.tabLabelActive
            ]}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'emotions' && renderEmotions()}
        {selectedTab === 'tags' && renderTags()}
        {selectedTab === 'timeline' && renderTimeline()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#6bb6ff',
    fontSize: 24,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#6bb6ff',
  },
  tabLabel: {
    fontSize: 12,
    marginLeft: 4,
    color: '#6bb6ff',
  },
  tabLabelActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    paddingBottom: 20,
  },
  statCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickStatItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickStatText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#6bb6ff',
    fontSize: 18,
  },
  recentSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
  },
  recentDreamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentDreamInfo: {
    flex: 1,
  },
  recentDreamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentDreamDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emotionBadge: {
    backgroundColor: '#f7a6c7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emotionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  emotionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emotionCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  tagName: {
    fontSize: 12,
    color: '#6bb6ff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7a6c7',
  },
  timelineItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timelineCount: {
    fontSize: 14,
    color: '#666',
  },
});
