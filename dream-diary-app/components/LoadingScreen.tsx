import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingScreenProps {
  message?: string;
  onPress?: () => void;
}

const loadingMessages = [
  "꿈을 불러오는 중... 💭",
  "달빛을 모으는 중... 🌙",
  "별빛을 수집하는 중... ⭐",
  "꿈나라로 여행 중... ✨",
  "기억을 되살리는 중... 🧠",
  "마법을 부리는 중... 🔮",
  "꿈의 문을 여는 중... 🚪",
  "상상력을 불러오는 중... 🎭",
  "꿈의 조각을 맞추는 중... 🧩",
  "환상의 세계로... 🌈"
];

export default function LoadingScreen({ message, onPress }: LoadingScreenProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [bubbleCount, setBubbleCount] = useState(0);
  const [visibleBubbles, setVisibleBubbles] = useState<Array<{id: number, x: number, y: number}>>([]);
  
  // 애니메이션 값들
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnims = useRef<Animated.Value[]>([]).current;
  const messageAnim = useRef(new Animated.Value(1)).current;
  const visibleBubbleAnims = useRef<{[key: number]: Animated.Value}>({}).current;

  // 메시지 변경 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(messageAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(messageAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [messageAnim]);

  // 회전 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  // 버블 애니메이션 초기화
  useEffect(() => {
    const newBubbles = Array.from({ length: 8 }, () => new Animated.Value(0));
    bubbleAnims.splice(0, bubbleAnims.length, ...newBubbles);
    
    newBubbles.forEach((bubble, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble, {
            toValue: 1,
            duration: 2000 + index * 300,
            useNativeDriver: true,
          }),
          Animated.timing(bubble, {
            toValue: 0,
            duration: 2000 + index * 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handlePress = () => {
    setIsPressed(true);
    
    // 버블 추가
    const newBubbleId = bubbleCount;
    setBubbleCount(prev => prev + 1);
    
    // 새로운 버블 위치 (랜덤)
    const newBubble = {
      id: newBubbleId,
      x: Math.random() * 300 - 150, // -150 ~ 150
      y: Math.random() * 200 - 100, // -100 ~ 100
    };
    
    setVisibleBubbles(prev => [...prev, newBubble]);
    
    // 새로운 버블 애니메이션 생성
    const bubbleAnim = new Animated.Value(0);
    visibleBubbleAnims[newBubbleId] = bubbleAnim;
    
    // 버블 애니메이션 (위로 떠오르면서 사라짐)
    Animated.sequence([
      Animated.timing(bubbleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 애니메이션 완료 후 버블 제거
      setVisibleBubbles(prev => prev.filter(bubble => bubble.id !== newBubbleId));
      delete visibleBubbleAnims[newBubbleId];
    });
    
    // 스케일 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 페이드 애니메이션
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setIsPressed(false), 200);
    onPress?.();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#e3f2fd', '#f7a6c7', '#e3f2fd']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* 배경 버블들 */}
      {bubbleAnims.map((bubble, index) => (
        <Animated.View
          key={index}
          style={[
            styles.backgroundBubble,
            {
              left: `${10 + index * 10}%`,
              top: `${20 + (index % 3) * 25}%`,
              opacity: bubble,
              transform: [
                {
                  translateY: bubble.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
                {
                  scale: bubble.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <View style={styles.content}>
        {/* 메인 로딩 아이콘 */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.iconContainer}
        >
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [
                  { rotate: spin },
                  { scale: scaleAnim },
                ],
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={isPressed ? ['#f7a6c7', '#6bb6ff'] : ['#6bb6ff', '#f7a6c7']}
              style={styles.iconGradient}
            >
              <Ionicons 
                name="moon" 
                size={60} 
                color="#fff" 
              />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* 생성된 버블들 */}
        {visibleBubbles.map((bubble) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.visibleBubble,
              {
                left: 150 + bubble.x,
                top: 100 + bubble.y,
                opacity: visibleBubbleAnims[bubble.id] || new Animated.Value(0),
                transform: [
                  {
                    translateY: visibleBubbleAnims[bubble.id]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -100],
                    }) || 0,
                  },
                  {
                    scale: visibleBubbleAnims[bubble.id]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1.5],
                    }) || 1,
                  },
                ],
              },
            ]}
          >
            <ThemedText style={styles.bubbleText}>🫧</ThemedText>
          </Animated.View>
        ))}

        {/* 로딩 메시지 */}
        <Animated.View style={{ opacity: messageAnim }}>
          <ThemedText type="title" style={styles.loadingText}>
            {message || loadingMessages[currentMessage]}
          </ThemedText>
        </Animated.View>

        {/* 인터랙티브 힌트 */}
        <ThemedText style={styles.hintText}>
          {bubbleCount > 0 ? `버블 ${bubbleCount}개 생성됨! 🫧` : '아이콘을 터치해보세요! 👆'}
        </ThemedText>

        {/* 로딩 점들 */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: bubbleAnims[index] || new Animated.Value(0),
                  transform: [
                    {
                      scale: bubbleAnims[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.2],
                      }) || 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconWrapper: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6bb6ff',
  },
  backgroundBubble: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  visibleBubble: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 20,
  },
}); 