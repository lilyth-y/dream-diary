import { getDreams, Dream } from './dreamService';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BackupData {
  dreams: Dream[];
  timestamp: string;
  version: string;
  userId: string;
}

const BACKUP_VERSION = '1.0.0';
const BACKUP_KEY = 'dream_backup_data';

// 로컬 백업 데이터 저장
export const saveLocalBackup = async (): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const dreams = await getDreams();
    const backupData: BackupData = {
      dreams,
      timestamp: new Date().toISOString(),
      version: BACKUP_VERSION,
      userId: user.uid,
    };

    await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
  } catch (error) {
    console.error('로컬 백업 저장 오류:', error);
    throw error;
  }
};

// 로컬 백업 데이터 불러오기
export const loadLocalBackup = async (): Promise<BackupData | null> => {
  try {
    const backupString = await AsyncStorage.getItem(BACKUP_KEY);
    if (backupString) {
      return JSON.parse(backupString);
    }
    return null;
  } catch (error) {
    console.error('로컬 백업 불러오기 오류:', error);
    return null;
  }
};

// 백업 데이터 내보내기 (JSON 파일)
export const exportBackupData = async (): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const dreams = await getDreams();
    const backupData: BackupData = {
      dreams,
      timestamp: new Date().toISOString(),
      version: BACKUP_VERSION,
      userId: user.uid,
    };

    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    console.error('백업 데이터 내보내기 오류:', error);
    throw error;
  }
};

// 백업 데이터 가져오기 (JSON 파일)
export const importBackupData = async (jsonData: string): Promise<BackupData> => {
  try {
    const backupData: BackupData = JSON.parse(jsonData);
    
    // 버전 호환성 확인
    if (!backupData.version || !backupData.dreams) {
      throw new Error('잘못된 백업 파일 형식입니다.');
    }

    return backupData;
  } catch (error) {
    console.error('백업 데이터 가져오기 오류:', error);
    throw error;
  }
};

// 백업 상태 확인
export const getBackupStatus = async (): Promise<{
  hasLocalBackup: boolean;
  lastBackupTime: string | null;
  dreamCount: number;
}> => {
  try {
    const backupData = await loadLocalBackup();
    const dreams = await getDreams();
    
    return {
      hasLocalBackup: !!backupData,
      lastBackupTime: backupData?.timestamp || null,
      dreamCount: dreams.length,
    };
  } catch (error) {
    console.error('백업 상태 확인 오류:', error);
    return {
      hasLocalBackup: false,
      lastBackupTime: null,
      dreamCount: 0,
    };
  }
};

// 구글 계정 연동 상태 확인
export const checkGoogleAccountStatus = async (): Promise<{
  isConnected: boolean;
  email: string | null;
}> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user && user.providerData.some(provider => provider.providerId === 'google.com')) {
      return {
        isConnected: true,
        email: user.email,
      };
    }
    
    return {
      isConnected: false,
      email: null,
    };
  } catch (error) {
    console.error('구글 계정 상태 확인 오류:', error);
    return {
      isConnected: false,
      email: null,
    };
  }
}; 