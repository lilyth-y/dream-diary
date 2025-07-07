# 💤 Lucid Dream Diary (루비드 드림 다이어리)

## 앱 소개

루비드 드림 다이어리는 사용자가 자신의 꿈을 기록하고, 관리하며, 다양한 방식으로 꿈을 해석할 수 있도록 돕는 꿈 일기장 앱입니다. Firebase와 AI를 활용하여 안전한 데이터 관리와 스마트한 꿈 해석 기능을 제공합니다.

---

## 주요 기능

- **회원가입/로그인**
  - 이메일, 비밀번호로 회원가입 및 로그인
  - **구글 계정으로 간편 로그인** 지원
- **꿈 일기 작성**
  - 날짜별로 꿈에 대한 내용을 자유롭게 기록
  - 꿈의 제목, 내용, 태그, 감정 등 다양한 정보 입력 가능
- **꿈 일기 목록/상세 보기**
  - 작성한 꿈 일기를 리스트로 확인
  - 각 일기 클릭 시 상세 내용 및 이미지 확인
- **꿈 이미지 업로드**
  - 꿈과 관련된 이미지를 업로드하여 시각적으로 기록
  - Firebase Storage 연동
- **프로필 관리**
  - 프로필 사진 업로드 및 변경
  - 사용자 정보 수정
- **데이터 백업/복원**
  - 꿈 일기 데이터를 안전하게 백업 및 복원
- **알림 기능**
  - 꿈 일기 작성 리마인더 등 푸시 알림 제공
- **AI 연동(예정)**
  - OpenAI API를 활용한 꿈 해석, 감정 분석 등

---

## 기술 스택

- **React Native + Expo** (웹/모바일 동시 지원)
- **Firebase** (Authentication, Firestore, Storage)
- **OpenAI API** (AI 기능)
- **React Navigation, Expo Router** (파일 기반 라우팅)
- **기타**: CORS, CSP, OAuth2 등 최신 웹 보안 적용

---

## 사용 방법

1. 저장소 클론 및 의존성 설치
   ```bash
   git clone [저장소 주소]
   cd dream-diary
   npm install
   ```
2. 개발 서버 실행
   ```bash
   npm start
   ```
3. 웹/모바일에서 접속하여 회원가입 및 꿈 일기 작성

---

## 폴더 구조

- `app/` : 주요 화면 및 라우팅
- `components/` : 공통 UI 컴포넌트
- `constants/` : 색상 등 상수
- `firebase.ts` : 파이어베이스 초기화
- `dreamService.ts` : 꿈 일기 관련 서비스
- `backupService.ts` : 데이터 백업/복원
- `openaiService.ts` : AI 연동

---

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
