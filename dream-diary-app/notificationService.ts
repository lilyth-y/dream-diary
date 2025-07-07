import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" 형식
}

const NOTIFICATION_SETTINGS_KEY = 'dream_reminder_settings';
const NOTIFICATION_ID = 'dream_reminder';

// 알림 권한 요청
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('dream-reminder', {
        name: '꿈 기록 리마인더',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  }
  
  return false;
};

// 알림 설정 저장
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('알림 설정 저장 오류:', error);
  }
};

// 알림 설정 불러오기
export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('알림 설정 불러오기 오류:', error);
  }
  
  // 기본 설정
  return {
    enabled: false,
    time: '09:00',
  };
};

// 알림 스케줄링
export const scheduleDreamReminder = async (settings: NotificationSettings): Promise<void> => {
  // 기존 알림 취소
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  
  if (!settings.enabled) {
    return;
  }
  
  const [hour, minute] = settings.time.split(':').map(Number);
  
  // 매일 특정 시간에 알림 스케줄링
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '꿈 기록 시간입니다! 💭',
      body: '오늘 밤 꾼 꿈을 기록해보세요.',
      data: { type: 'dream_reminder' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
    identifier: NOTIFICATION_ID,
  });
};

// 알림 취소
export const cancelDreamReminder = async (): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
};

// 알림 설정 업데이트
export const updateNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  await saveNotificationSettings(settings);
  await scheduleDreamReminder(settings);
};

// 현재 스케줄된 알림 확인
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  return await Notifications.getAllScheduledNotificationsAsync();
}; 