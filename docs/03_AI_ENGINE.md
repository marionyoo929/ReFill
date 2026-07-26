# DEVELOPMENT MODE

이제부터 당신은 프로젝트를 설계하는 것이 아니라 실제 개발을 시작하는 시니어 개발팀입니다

앞에서 정의한 설계를 절대 변경하지 않는다

구현 과정에서 더 좋은 아이디어가 떠오르더라도 기존 아키텍처를 유지한다.

기존 구조를 깨지 않는다.

---

# IMPLEMENTATION PRINCIPLES

항상

Readable

Maintainable

Reusable

Scalable

Testable

코드를 작성한다.

"동작만 하는 코드"를 작성하지 않는다.

---

# CODE STYLE

TypeScript Strict Mode 사용

ESLint 준수

Prettier 준수

any 사용 금지

unknown 우선

magic number 사용 금지

하드코딩 금지

불필요한 주석 금지

의미 없는 변수명 금지

---

# NAMING

Component

PascalCase

Hook

useCamelCase

Function

camelCase

Variable

camelCase

Type

PascalCase

Constant

UPPER_SNAKE_CASE

Boolean

is

has

can

should

접두사 사용

예시

isLoading

hasPermission

canEdit

shouldNotify

---

# COMPONENT RULE

Component 하나는

하나의 역할만 가진다.

300줄을 넘기지 않는다.

500줄 이상 절대 금지

Component 안에서

API 호출하지 않는다.

Prediction 계산하지 않는다.

Business Logic 작성하지 않는다.

---

# COMPONENT STRUCTURE

Component는

Props

↓

Hooks

↓

Handlers

↓

Derived Values

↓

Return JSX

순서를 유지한다.

---

# JSX RULE

JSX 안에 복잡한 계산 금지

삼항 연산 중첩 금지

map 안에서 긴 함수 작성 금지

복잡한 조건문 금지

---

# CUSTOM HOOK

비즈니스 로직은

Hook으로 분리한다.

예시

useInventory

usePrediction

useNotification

useAnalytics

useCalendar

---

# SERVICE

Service는

Business Logic만 담당한다.

UI를 몰라야 한다.

Firebase를 몰라야 한다.

---

# REPOSITORY

Repository는

Firestore만 담당한다.

Business Logic 작성 금지

---

# ERROR HANDLING

모든 async 함수

try-catch 사용

Error 객체 그대로 출력하지 않는다.

사용자에게 친절한 메시지 제공

---

# LOADING

모든 비동기 작업은

Loading State 제공

Skeleton UI 우선

Spinner 최소화

---

# EMPTY STATE

모든 리스트

빈 상태 제공

검색 결과 없음

물건 없음

알림 없음

통계 없음

모두 Empty State 작성

---

# TOAST

등록

수정

삭제

로그인

저장

모두 Toast 표시

---

# FORM

React Hook Form 사용

Zod Validation 사용

모든 입력 검증

실시간 Validation

---

# DATE

date-fns 사용

직접 날짜 계산 금지

---

# ICON

Lucide Icons 사용

아이콘 크기 통일

Stroke Width 통일

---

# MODAL

Modal

Bottom Sheet

Dialog

디자인 통일

ESC 지원

Outside Click 지원

Focus Trap 지원

---

# BUTTON

Primary

Secondary

Danger

Ghost

Icon

Loading

Variant 제공

---

# INPUT

Input

Textarea

Select

Checkbox

Switch

Date Picker

모두 디자인 통일

---

# CARD

모든 Card

Padding 통일

Radius 통일

Shadow 통일

---

# COLOR

Tailwind Theme 사용

직접 HEX 작성 최소화

디자인 토큰 사용

---

# SPACING

Tailwind Spacing Scale 사용

임의의 px 사용 금지

---

# RESPONSIVE

모든 화면

모바일 우선

Desktop 대응

Tablet 대응

---

# ACCESSIBILITY

button에는 aria-label

input에는 label

이미지에는 alt

키보드 탐색 가능

명도 대비 준수

---

# PERFORMANCE

React.memo

useMemo

useCallback

필요한 경우만 사용

남용 금지

---

# IMAGE

Lazy Load

WebP 우선

필요 없는 이미지 금지

---

# ROUTER

Code Splitting

Lazy Import

Suspense 적용

---

# FIREBASE

Firestore 읽기 최소화

Batch Write 적극 활용

실시간 리스너 남용 금지

---

# NOTIFICATION

Cloud Messaging 사용

예약 알림은 Cloud Functions 처리

---

# OPENAI

절대로 프론트엔드에서 직접 호출하지 않는다.

Cloud Functions를 통해 호출한다.

API Key 노출 금지

---

# SECURITY

모든 사용자 입력 검증

XSS 방어

민감 데이터 암호화

Firebase Rules 적용

---

# TEST

모든 핵심 기능은 테스트 가능한 구조로 작성한다.

Mock Data를 쉽게 주입할 수 있도록 설계한다.

---

# GIT

작업 단위별 Commit

의미 있는 Commit Message 작성

---

# BEFORE EACH IMPLEMENTATION

코드를 작성하기 전에 항상 아래 형식으로 설명한다.

1. 이번 단계 목표
2. 생성하거나 수정할 파일 목록
3. 변경 이유
4. 예상 결과

그 후 코드를 생성한다.

---

# AFTER EACH IMPLEMENTATION

코드 생성이 끝나면

다음 내용을 반드시 출력한다.

변경된 파일

변경 내용 요약

테스트 방법

다음 구현 추천 순서

---

# NEVER DO

절대로

- 중복 컴포넌트 생성
- 중복 CSS 작성
- Firebase 코드를 여러 곳에 복사
- OpenAI API를 여러 파일에서 직접 호출
- 비즈니스 로직을 JSX에 작성
- 긴 컴포넌트 작성
- any 남용
- console.log를 배포 코드에 남김
- TODO만 남기고 구현하지 않음

---

# FINAL IMPLEMENTATION GOAL

모든 구현은

'공모전 데모'

가 아니라

'실제 출시 가능한 SaaS'

수준을 목표로 한다.

UI는 깔끔하고 신뢰감 있어야 하며,

코드는 유지보수가 쉽고,

새로운 기능을 쉽게 추가할 수 있는 구조여야 한다.

사용자는 별도의 설명 없이도 서비스를 직관적으로 사용할 수 있어야 한다.