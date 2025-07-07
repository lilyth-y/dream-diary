import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useRouter } from 'expo-router';
import { createDream } from '../../dreamService';
import { Ionicons } from '@expo/vector-icons';
import * as Audio from 'expo-audio';
import { getDreamImage } from '../../openaiService';

export default function WriteDreamScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // 음성 녹음 시작/정지
  const handleRecord = async () => {
    try {
      if (recording) {
        setAudioLoading(true);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri || null);
        setRecording(null);
        setAudioLoading(false);
      } else {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert('권한 필요', '마이크 권한이 필요합니다.');
          return;
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
      }
    } catch (e) {
      Alert.alert('녹음 오류', '음성 녹음 중 오류가 발생했습니다.');
      setAudioLoading(false);
    }
  };

  // 음성 재생
  const handlePlay = async () => {
    if (!audioUri) return;
    setAudioLoading(true);
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    setIsPlaying(true);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded || status.didJustFinish) {
        setIsPlaying(false);
        setAudioLoading(false);
        sound.unloadAsync();
      }
    });
    await sound.playAsync();
  };

  // 음성 삭제
  const handleDeleteAudio = () => {
    setAudioUri(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      // 현재 날짜
      const today = new Date().toISOString().split('T')[0];
      await createDream({
        title: title.trim(),
        content: content.trim(),
        tags,
        date: today,
        imageUrl: imageUrl || undefined,
        // audioUri: audioUri (추후 Storage 연동 시 저장)
      });
      Alert.alert('성공', '꿈 일기가 저장되었습니다.');
      router.replace('/');
    } catch (error) {
      console.error('저장 오류:', error);
      Alert.alert('오류', '꿈 일기 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // AI 이미지 생성
  const handleGenerateImage = async () => {
    if (!content.trim()) {
      Alert.alert('입력 오류', '꿈 내용을 입력한 후 이미지를 생성해 주세요.');
      return;
    }
    try {
      setImageLoading(true);
      const url = await getDreamImage(content.trim());
      setImageUrl(url);
    } catch (error) {
      Alert.alert('오류', '이미지 생성에 실패했습니다.');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.bg}>
      <View style={styles.container}>
        <ThemedText type="title">꿈 일기 작성</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="꿈 내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.input, styles.tagInput]}
            placeholder="태그를 입력하고 + 버튼을 누르세요"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAddTag}
            maxLength={20}
          />
          <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
            <Ionicons name="add-circle" size={32} color="#6bb6ff" />
          </TouchableOpacity>
        </View>
        <View style={styles.tagList}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <ThemedText style={styles.tagText}>#{tag}</ThemedText>
              <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                <Ionicons name="close-circle" size={20} color="#f7a6c7" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {/* 음성 녹음/재생 UI */}
        <View style={styles.audioRow}>
          <TouchableOpacity style={styles.audioFab} onPress={handleRecord} disabled={audioLoading}>
            <Ionicons name={recording ? 'stop-circle' : 'mic-circle'} size={44} color={recording ? '#f7a6c7' : '#6bb6ff'} />
            <ThemedText style={styles.audioFabText}>{recording ? '녹음 중지' : '음성 녹음'}</ThemedText>
          </TouchableOpacity>
          {audioUri && !recording && (
            <>
              <TouchableOpacity style={styles.audioFab} onPress={handlePlay} disabled={audioLoading || isPlaying}>
                <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={44} color="#6bb6ff" />
                <ThemedText style={styles.audioFabText}>재생</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.audioFab} onPress={handleDeleteAudio} disabled={audioLoading}>
                <Ionicons name="trash" size={36} color="#f7a6c7" />
                <ThemedText style={styles.audioFabText}>삭제</ThemedText>
              </TouchableOpacity>
            </>
          )}
          {audioLoading && <ActivityIndicator color="#6bb6ff" style={{ marginLeft: 8 }} />}
        </View>
        {/* AI 이미지 생성 UI */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <TouchableOpacity onPress={handleGenerateImage} style={{ backgroundColor: '#6bb6ff', padding: 12, borderRadius: 8 }} disabled={imageLoading}>
            <ThemedText style={{ color: '#fff' }}>{imageLoading ? '이미지 생성 중...' : 'AI로 이미지 생성'}</ThemedText>
          </TouchableOpacity>
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginTop: 12, borderRadius: 16 }} />
          )}
        </View>
        <Button
          title={loading ? "저장 중..." : "저장"}
          onPress={handleSave}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flexGrow: 1,
    backgroundColor: 'linear-gradient(180deg, #e3f0ff 0%, #f7a6c7 100%)',
    minHeight: '100%',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    margin: 16,
    gap: 16,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b2d8f7',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 0,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagBtn: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f0ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
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
    marginRight: 4,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 16,
    justifyContent: 'center',
  },
  audioFab: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f0ff',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 4,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#f7a6c7',
    minWidth: 80,
  },
  audioFabText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 6,
  },
}); 