import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRootNavigationState, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, signOut, updateProfile, User } from 'firebase/auth';
import { collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ImageBackground, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../components/LoadingScreen';
import { ThemedText } from '../../components/ThemedText';
import { Dream } from '../../dreamService';

const pastelGradient = require('../../assets/images/pastel-bg.png'); // 그라데이션 배경 이미지(없으면 나중에 추가)
const defaultProfileImg = require('../../assets/images/icon.png');

// Storage에 이미지 업로드 후 다운로드 URL 반환 (웹/앱 분기)
async function uploadProfileImageToStorage(fileOrUri: any, userId: string): Promise<string> {
  try {
    console.log('업로드 시작', fileOrUri, userId);
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${userId}.jpg`);
    if (Platform.OS === 'web') {
      console.log('웹 환경: uploadBytes 시작');
      await uploadBytes(storageRef, fileOrUri);
      console.log('웹 업로드 성공');
    } else {
      console.log('앱 환경: fetch/Blob 변환 시작');
      const response = await fetch(fileOrUri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      console.log('앱 업로드 성공');
    }
    const downloadURL = await getDownloadURL(storageRef);
    console.log('다운로드 URL', downloadURL);
    return downloadURL;
  } catch (e) {
    console.error('Storage 업로드 오류', e);
    throw e;
  }
}

// Storage에서 프로필 이미지 삭제
async function deleteProfileImageFromStorage(userId: string) {
  const storage = getStorage();
  const storageRef = ref(storage, `profileImages/${userId}.jpg`);
  await deleteObject(storageRef).catch(() => {}); // 없으면 무시
}

export default function DreamListScreen() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const rootNavigation = useRootNavigationState();
  const [profileVisible, setProfileVisible] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useFocusEffect(
    useCallback(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setLoading(true);
          const q = query(collection(db, 'dreams'), where('userId', '==', currentUser.uid));
          const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const userDreams = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date.toDate().toISOString(),
            })) as Dream[];
            setDreams(userDreams);
            setLoading(false);
          }, (error) => {
            console.error("Error fetching dreams:", error);
            setLoading(false);
          });
          return () => unsubscribeSnapshot();
        } else {
          setDreams([]);
          setLoading(false);
        }
      });
      return () => unsubscribeAuth();
    }, [auth, db])
  );
  
  useEffect(() => {
    if (rootNavigation?.key && user === null) {
      router.replace('/login');
    }
  }, [user, rootNavigation]);
  
  useEffect(() => {
    setEditName(user?.displayName || '');
    setEditPhoto(user?.photoURL || null);
    setEditingName(false);
  }, [profileVisible, user]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert('로그아웃 오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  const deleteDream = async (dreamId: string) => { /* ... */ };
  
  const confirmDelete = (dreamId: string) => {
    Alert.alert(
      "삭제 확인",
      "정말로 이 꿈 일기를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: () => deleteDream(dreamId) },
      ]
    );
  };

  const handleItemPress = (item: Dream) => {
    if (item.id) {
      router.push(`/(tabs)/detail?id=${item.id}`);
    } else {
      Alert.alert('오류', '상세 정보를 불러올 수 없습니다.');
    }
  };

  // 모든 태그 모음
  const allTags = Array.from(new Set(dreams.flatMap(d => d.tags)));

  // 검색/필터 적용
  const filteredDreams = dreams.filter(dream => {
    const matchDate = selectedDate ? dream.date === selectedDate : true;
    const matchTag = selectedTag ? dream.tags.includes(selectedTag) : true;
    const matchSearch = search.trim() ? (
      dream.title.includes(search) ||
      dream.content.includes(search) ||
      dream.tags.some(tag => tag.includes(search))
    ) : true;
    return matchDate && matchTag && matchSearch;
  });

  const renderItem = ({ item }: { item: Dream }) => (
    <TouchableOpacity style={styles.dreamItem} onPress={() => handleItemPress(item)}>
      <View style={styles.dreamHeader}>
        <ThemedText style={styles.dreamTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.dreamDate}>{format(new Date(item.date), 'yyyy.MM.dd')}</ThemedText>
      </View>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80, borderRadius: 8, marginVertical: 8, alignSelf: 'center' }} />
      )}
      <ThemedText style={styles.dreamContent} numberOfLines={2}>{item.content}</ThemedText>
      <View style={styles.tagContainer}>
          {item.tags?.map((tag, index) => <ThemedText key={index} style={styles.tag}>#{tag}</ThemedText>)}
      </View>
      <TouchableOpacity 
        onPress={() => item.id && confirmDelete(item.id)} 
        style={styles.deleteButton}
        disabled={!item.id}
      >
          <ThemedText style={styles.deleteButtonText}>삭제</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handlePickImage = async () => {
    if (!user) {
      Alert.alert('오류', '로그인 후 이용해 주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setImageLoading(true);
      try {
        // 이미지 선택 즉시 Storage 업로드
        const downloadURL = await uploadProfileImageToStorage(result.assets[0].uri, user.uid);
        setEditPhoto(downloadURL); // Storage URL로 미리보기
      } catch (e) {
        Alert.alert('업로드 오류', '이미지 업로드에 실패했습니다.');
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setImageLoading(true);
    try {
      let photoURL = user.photoURL;
      if (editPhoto === null && user.photoURL) {
        // 사진 삭제
        await deleteProfileImageFromStorage(user.uid);
        photoURL = null;
      } else if (editPhoto && editPhoto !== user.photoURL) {
        // 새 이미지가 이미 Storage에 업로드되어 있으므로 이전 이미지 삭제
        if (user.photoURL) {
          await deleteProfileImageFromStorage(user.uid);
        }
        photoURL = editPhoto; // Storage URL
      }
      await updateProfile(user, {
        displayName: editName,
        photoURL: photoURL || null,
      });
      setUser({ ...user, displayName: editName, photoURL });
      setEditingName(false);
      Alert.alert('프로필 저장', '프로필이 변경되었습니다.');
    } catch (e) {
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
    } finally {
      setSavingProfile(false);
      setImageLoading(false);
    }
  };

  const handleCloseProfileModal = async () => {
    if (editPhoto && user && editPhoto !== user.photoURL) {
      await deleteProfileImageFromStorage(user.uid);
    }
    setProfileVisible(false);
    setEditPhoto(user?.photoURL || null);
    setEditName(user?.displayName || '');
    setEditingName(false);
  };

  // 웹 환경에서 파일 선택 핸들러
  const handleWebFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      Alert.alert('오류', '로그인 후 이용해 주세요.');
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setImageLoading(true);
      try {
        console.log('웹 파일 선택됨:', file);
        const downloadURL = await uploadProfileImageToStorage(file, user.uid);
        console.log('업로드 후 downloadURL:', downloadURL);
        setEditPhoto(downloadURL);
      } catch (e) {
        console.error('웹 업로드 오류:', e);
        Alert.alert('업로드 오류', '이미지 업로드에 실패했습니다.');
      } finally {
        setImageLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <ImageBackground source={pastelGradient} style={styles.bg} resizeMode="cover">
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 + insets.bottom }} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.profileBtn}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <ThemedText style={styles.avatarText}>{user?.displayName?.[0] || user?.email?.[0] || 'P'}</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              <ThemedText style={styles.welcomeText}>
                {user?.displayName ? `${user.displayName}님의 꿈` : '나의 꿈 목록'}
              </ThemedText>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <ThemedText style={styles.logoutButtonText}>로그아웃</ThemedText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => router.push('/write')}
              style={[styles.addButton, { bottom: 24 + insets.bottom }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'rgba(255,255,255,0.7)',
                selectedDayBackgroundColor: '#f7a6c7',
                selectedDayTextColor: '#fff',
                todayTextColor: '#6bb6ff',
                dayTextColor: '#6bb6ff',
                textDisabledColor: '#d9e1e8',
                monthTextColor: '#6bb6ff',
                arrowColor: '#f7a6c7',
                textDayFontWeight: 'bold',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
              onDayPress={day => {
                setSelectedDate(day.dateString);
                // 해당 날짜의 꿈이 있는지 확인
                const hasDreamOnDate = dreams.some(dream => dream.date === day.dateString);
                if (hasDreamOnDate) {
                  Alert.alert(
                    `${day.dateString}의 꿈`,
                    '이 날짜에 기록된 꿈이 있습니다. 목록에서 확인해보세요!',
                    [{ text: '확인' }]
                  );
                }
              }}
              markedDates={selectedDate ? { [selectedDate]: { selected: true } } : {}}
            />
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="꿈, 태그, 내용 검색"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#b2d8f7"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={22} color="#f7a6c7" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagFilterRow} contentContainerStyle={{alignItems:'center',paddingHorizontal:8}}>
              <TouchableOpacity
                style={[styles.tagFilterBtn, !selectedTag && styles.tagFilterBtnActive]}
                onPress={() => setSelectedTag('')}
              >
                <ThemedText style={styles.tagFilterText}>전체</ThemedText>
              </TouchableOpacity>
              {allTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagFilterBtn, selectedTag === tag && styles.tagFilterBtnActive]}
                  onPress={() => setSelectedTag(tag)}
                >
                  <ThemedText style={styles.tagFilterText}>#{tag}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={handleCloseProfileModal}>
              <View style={styles.modalBg}>
                <View style={styles.profileModal}>
                  <View style={{ alignItems: 'center', marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => {
                      if (Platform.OS === 'web') {
                        fileInputRef.current?.click();
                      } else {
                        handlePickImage();
                      }
                    }} style={styles.profileImgBtn} disabled={imageLoading}>
                      <Image
                        source={editPhoto ? { uri: editPhoto } : defaultProfileImg}
                        style={styles.profileImg}
                      />
                      {imageLoading && <ActivityIndicator size="small" color="#6bb6ff" style={{ position: 'absolute', top: 30, left: 30 }} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          fileInputRef.current?.click();
                        } else {
                          handlePickImage();
                        }
                      }}
                      style={styles.profileChangeBtn}
                      disabled={imageLoading}
                    >
                      <ThemedText style={styles.profileChangeText}>사진 변경</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={{ color: '#b2d8f7', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
                    프로필 사진은 jpg, jpeg, png 파일만 지원하며, 5MB 이하 이미지만 업로드할 수 있습니다.
                  </ThemedText>
                  {(editPhoto || user?.photoURL) && (
                    <TouchableOpacity style={styles.profileDeleteBtn} onPress={() => setEditPhoto(null)} disabled={imageLoading}>
                      <ThemedText style={styles.profileDeleteText}>사진 삭제</ThemedText>
                    </TouchableOpacity>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <TextInput
                      style={[styles.profileNameInput, { flex: 1 }]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="닉네임"
                      maxLength={16}
                      editable={editingName}
                    />
                    {!editingName ? (
                      <TouchableOpacity style={styles.profileEditBtn} onPress={() => setEditingName(true)}>
                        <ThemedText style={styles.profileEditText}>수정</ThemedText>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.profileSaveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                        <ThemedText style={styles.profileSaveText}>{savingProfile ? '저장 중...' : '저장'}</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                  <ThemedText style={{ marginBottom: 8 }}>이메일: {user?.email}</ThemedText>
                  <TouchableOpacity style={styles.profileActionBtn} onPress={() => { setProfileVisible(false); Alert.alert('준비 중', '비밀번호 변경 기능은 추후 제공됩니다.'); }}>
                    <ThemedText style={styles.profileActionText}>비밀번호 변경</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.profileActionBtn} onPress={() => { setProfileVisible(false); handleLogout(); }}>
                    <ThemedText style={[styles.profileActionText, { color: '#ff8a80' }]}>로그아웃</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.profileCloseBtn} onPress={handleCloseProfileModal}>
                    <ThemedText style={styles.profileCloseText}>닫기</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            {Platform.OS === 'web' && profileVisible && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleWebFileChange}
                disabled={imageLoading}
              />
            )}
            {filteredDreams.length === 0 ? (
              <View style={[styles.emptyContainer, { marginBottom: 100 + insets.bottom }]}>
                <ThemedText type="subtitle" style={styles.emptyTitle}>꿈 일기가 없습니다.</ThemedText>
                <ThemedText type="default" style={styles.emptySubtitle}>+ 버튼을 눌러 꿈을 기록하세요.</ThemedText>
              </View>
            ) : (
              <FlatList
                data={filteredDreams}
                renderItem={renderItem}
                keyExtractor={item => item.id || ''}
                contentContainerStyle={[styles.listContent, { paddingBottom: 32 + insets.bottom }]}
              />
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
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
    minHeight: '100%',
    backgroundColor: 'transparent',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  profileBtn: {
    marginRight: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#b2d8f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff8a80',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#8e9bf2',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  calendar: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#6bb6ff',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  clearBtn: {
    marginLeft: 4,
  },
  tagFilterRow: {
    minHeight: 40,
    marginBottom: 8,
  },
  tagFilterBtn: {
    backgroundColor: '#e3f0ff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#b2d8f7',
  },
  tagFilterBtnActive: {
    backgroundColor: '#f7a6c7',
    borderColor: '#f7a6c7',
  },
  tagFilterText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModal: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImgBtn: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    marginBottom: 4,
  },
  profileChangeBtn: {
    backgroundColor: '#b2d8f7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    alignSelf: 'center',
  },
  profileChangeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  profileNameInput: {
    width: 180,
    borderBottomWidth: 1,
    borderColor: '#b2d8f7',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  profileSaveBtn: {
    backgroundColor: '#6bb6ff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginBottom: 10,
  },
  profileSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileActionBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f7faff',
    marginTop: 8,
  },
  profileActionText: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileCloseBtn: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#b2d8f7',
  },
  profileCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    marginTop: 16,
    marginBottom: 100,
    alignSelf: 'stretch',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 24,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#6bb6ff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#b2d8f7',
    textAlign: 'center',
  },
  dreamItem: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#b2d8f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#e3e8ff',
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dreamTitle: {
    color: '#6bb6ff',
    fontWeight: 'bold',
    fontSize: 20,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dreamDate: {
    color: '#f7a6c7',
    fontSize: 14,
  },
  dreamContent: {
    color: '#6bb6ff',
    fontSize: 16,
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
  deleteButton: {
    padding: 6,
    backgroundColor: '#ff8a80',
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6bb6ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6bb6ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  profileEditBtn: {
    backgroundColor: '#b2d8f7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  profileEditText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  profileDeleteBtn: {
    backgroundColor: '#f7a6c7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'center',
  },
  profileDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 32,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#b2d8f7',
    resizeMode: 'cover',
  },
});
