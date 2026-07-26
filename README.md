# Re:Fill

> 필요하기 전에, 먼저 채우다.

Re:Fill은 단순한 체크리스트 앱이 아니라 **생활 소비 예측 플랫폼**입니다. 사용자가 등록한 생필품(샴푸, 세제, 칫솔 등)의 소진 시점을 AI가 예측하고, 소진되기 전에 미리 알려주어 "언제 주문해야 하는가"를 사용자가 더 이상 기억하지 않아도 되게 합니다.

핵심 기능은 **Prediction Engine**이며, UI/Firebase/React로부터 완전히 독립된 도메인 계층으로 설계되어 있습니다. 자세한 제품/아키텍처/AI 엔진/코딩 표준 규칙은 [`docs/`](./docs) 폴더를 참고하세요.

- [01_PRD.md](./docs/01_PRD.md) - 제품 요구사항
- [02_PROJECT_ARCHITECTURE.md](./docs/02_PROJECT_ARCHITECTURE.md) - 시스템/폴더/Firestore 구조
- [03_AI_ENGINE.md](./docs/03_AI_ENGINE.md) - Prediction Engine 설계
- [04_CODING_STANDARDS.md](./docs/04_CODING_STANDARDS.md) - 코드 스타일 규칙
- [05_DEVELOPMENT_WORKFLOW.md](./docs/05_DEVELOPMENT_WORKFLOW.md) - 개발 진행 방식

## Tech Stack

| 영역     | 기술                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, TailwindCSS 4, React Router 7                       |
| 상태관리 | React Query(서버 상태), Local State/Context(클라이언트 상태)                    |
| Form     | React Hook Form + Zod                                                           |
| Backend  | Firebase (Authentication, Firestore, Cloud Functions, Cloud Messaging, Storage) |
| AI       | OpenAI API (Cloud Functions 경유 호출, 프론트엔드 직접 호출 금지)               |
| 배포     | Vercel (Frontend), Firebase (Backend)                                           |

## 폴더 구조

Feature-Based Architecture를 사용하며, 모든 데이터 흐름은 아래 단방향 계층을 따릅니다.

```
Presentation(UI) → Application(Hook) → Service(Business Logic) → Repository(Firestore) → Firebase / OpenAI
```

```
src/
  app/            # App 진입점 (main.tsx, App.tsx)
  assets/         # 정적 리소스
  components/
    common/       # 여러 Feature가 공유하는 범용 컴포넌트
    layout/       # TopNav, BottomNav, Sidebar, FAB 등 레이아웃
    ui/           # Button, Input, Card 등 디자인 시스템 기본 요소
  features/       # auth, calendar, inventory, prediction, notification, analytics, settings
    <feature>/
      components/ hooks/ pages/ services/ types/ utils/ index.ts
  hooks/          # Feature에 속하지 않는 전역 공통 훅
  pages/          # 라우트에 연결되는 최상위 페이지
  providers/      # QueryProvider 등 App 전역 Provider
  contexts/       # 전역으로 꼭 필요한 최소한의 Context
  services/       # Feature 간 공유되는 Business Logic
  repositories/   # Firestore 접근 전담 계층
  firebase/       # Firebase 클라이언트 SDK 초기화
  api/            # 외부 API 클라이언트 (Cloud Functions 호출 등)
  types/          # 전역 타입
  utils/          # 순수 유틸 함수
  constants/      # 라우트 경로 등 상수
  lib/            # cn() 등 재사용 라이브러리성 헬퍼
  styles/         # Tailwind 진입 CSS, 디자인 토큰
  routes/         # React Router 라우터 정의
  config/         # 환경 변수 등 앱 설정
  store/          # 향후 전역 클라이언트 상태 저장소 (현재 비어 있음)
functions/        # Firebase Cloud Functions (OpenAI 프록시, 알림 스케줄링)
```

Prediction 로직은 UI 컴포넌트 안에 작성하지 않으며, 향후 ML 모델로 교체 가능하도록 `PredictionService` 인터페이스를 통해서만 호출됩니다.

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

Firebase Console에서 프로젝트를 생성한 뒤 웹 앱을 등록하고, 발급된 설정 값을 `.env.local`에 채워 넣습니다. OpenAI API Key는 프론트엔드 환경 변수에 절대 포함하지 않으며, `functions/.env.example`을 참고하여 Cloud Functions 쪽에서만 관리합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 주요 스크립트

| 명령어                 | 설명                        |
| ---------------------- | --------------------------- |
| `npm run dev`          | 개발 서버 실행              |
| `npm run build`        | 타입 체크 후 프로덕션 빌드  |
| `npm run preview`      | 빌드 결과 로컬 미리보기     |
| `npm run lint`         | ESLint 검사                 |
| `npm run lint:fix`     | ESLint 자동 수정            |
| `npm run format`       | Prettier 포맷팅 적용        |
| `npm run format:check` | Prettier 포맷팅 검사        |
| `npm run typecheck`    | TypeScript 타입 검사만 수행 |

### 5. Firebase 프로젝트 연결 (최초 1회)

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정 > 내 앱에서 **Web App**을 등록하고 발급된 설정 값을 확인합니다.
3. **Authentication > Sign-in method**에서 **Email/Password** 제공업체를 활성화합니다.
4. **Firestore Database**를 생성합니다(프로덕션 모드 권장, 위치는 가까운 리전 선택).
5. `.env.example`을 `.env.local`로 복사하고 2번에서 확인한 값을 채워 넣습니다.
6. Security Rules를 적용합니다.

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # 생성한 Firebase 프로젝트 선택
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 6. Firebase Emulator로 로컬 테스트 (선택, 실제 프로젝트 없이도 가능)

Java가 설치되어 있어야 Firestore Emulator를 사용할 수 있습니다(Auth Emulator는 Java가 필요 없습니다).

```bash
firebase emulators:start --only auth,firestore
```

`.env.local`에 아래와 같이 설정하면 앱이 로컬 Emulator에 연결됩니다. 실제 프로젝트가 없어도 `VITE_FIREBASE_PROJECT_ID`를 `demo-`로 시작하는 값으로 두면 테스트할 수 있습니다.

```bash
VITE_FIREBASE_PROJECT_ID=demo-refill
VITE_USE_FIREBASE_EMULATOR=true
```

Emulator UI: http://127.0.0.1:4000

## 개발 원칙

- 한 번에 하나의 Feature만 구현하며, Feature 완료 후 다음 Feature로 진행합니다. (`05_DEVELOPMENT_WORKFLOW.md`)
- 컴포넌트 500줄 초과 금지, `any` 사용 금지, Prediction/Business Logic을 컴포넌트 안에 작성하지 않습니다.
- OpenAI는 Product DB → Cache → OpenAI 순서로만 호출하며, 항상 Cloud Functions를 경유합니다.
- 모든 사용자 데이터는 Firestore Security Rules로 본인 소유 데이터만 접근 가능하도록 보호됩니다.

## 프로젝트 진행 상황

```
Project Progress
██░░░░░░░░ 10%

Completed
- Project Initial Setup

Current
- (다음 Feature 대기 중)

Next
- Authentication Feature
```
