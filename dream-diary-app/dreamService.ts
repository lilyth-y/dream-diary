import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { getEmbedding, analyzeDream } from './openaiService';

// 꿈 일기 데이터 타입 정의
export interface Dream {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  embedding?: number[];
  imageUrl?: string;
  emotion?: string; // 감정 분석 결과
  keywords?: string[]; // 키워드 분석 결과
  summary?: string; // 꿈 요약
}

// 꿈 일기 생성 (임베딩 및 분석 포함)
export const createDream = async (dreamData: Omit<Dream, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'embedding' | 'emotion' | 'keywords' | 'summary'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    // 임베딩 생성 (제목+내용+태그)
    const embedding = await getEmbedding(
      [dreamData.title, dreamData.content, ...dreamData.tags].join(' ')
    );

    // 꿈 분석 (감정, 키워드, 요약)
    const analysis = await analyzeDream(dreamData.content);

    const dream: Omit<Dream, 'id'> = {
      ...dreamData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      embedding,
      emotion: analysis.emotion,
      keywords: analysis.keywords,
      summary: analysis.summary,
    };

    const docRef = await addDoc(collection(db, 'dreams'), dream);
    return { id: docRef.id, ...dream };
  } catch (error) {
    console.error('꿈 일기 생성 오류:', error);
    throw error;
  }
};

// 꿈 일기 목록 조회 (최신순)
export const getDreams = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const q = query(
      collection(db, 'dreams'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const dreams: Dream[] = [];
    
    querySnapshot.forEach((doc) => {
      dreams.push({ id: doc.id, ...doc.data() } as Dream);
    });
    
    return dreams;
  } catch (error) {
    console.error('꿈 일기 조회 오류:', error);
    throw error;
  }
};

// 꿈 일기 수정
export const updateDream = async (id: string, dreamData: Partial<Dream>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const dreamRef = doc(db, 'dreams', id);
    await updateDoc(dreamRef, {
      ...dreamData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('꿈 일기 수정 오류:', error);
    throw error;
  }
};

// 꿈 일기 삭제
export const deleteDream = async (id: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    await deleteDoc(doc(db, 'dreams', id));
  } catch (error) {
    console.error('꿈 일기 삭제 오류:', error);
    throw error;
  }
};

// 꿈 통계 조회
export const getDreamStats = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const dreams = await getDreams();
    
    // 감정별 통계
    const emotionStats = dreams.reduce((acc, dream) => {
      if (dream.emotion) {
        acc[dream.emotion] = (acc[dream.emotion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // 태그별 통계
    const tagStats = dreams.reduce((acc, dream) => {
      dream.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // 월별 꿈 개수
    const monthlyStats = dreams.reduce((acc, dream) => {
      const month = new Date(dream.date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDreams: dreams.length,
      emotionStats,
      tagStats,
      monthlyStats,
      recentDreams: dreams.slice(0, 5), // 최근 5개 꿈
    };
  } catch (error) {
    console.error('꿈 통계 조회 오류:', error);
    throw error;
  }
}; 