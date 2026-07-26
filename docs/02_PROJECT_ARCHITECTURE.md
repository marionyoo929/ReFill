# SYSTEM ARCHITECTURE

이 프로젝트는 Feature-Based Architecture를 사용한다.

Presentation Layer

↓

Application Layer

↓

Service Layer

↓

Repository Layer

↓

Firebase

↓

OpenAI

의 구조를 유지한다.

각 Layer는 역할이 명확해야 한다.

UI는 데이터를 가져오는 방법을 몰라야 한다.

Service는 Firebase 구현을 몰라야 한다.

Prediction Engine은 UI와 완전히 독립적으로 동작해야 한다.

---

# PROJECT STRUCTURE

src

app/

- App.tsx

- main.tsx

assets/

components/

common/

layout/

ui/

features/

auth/

calendar/

inventory/

prediction/

notification/

analytics/

settings/

hooks/

pages/

providers/

contexts/

services/

repositories/

firebase/

api/

types/

utils/

constants/

lib/

styles/

routes/

config/

store/

---

# FEATURE STRUCTURE

모든 Feature는 동일한 구조를 가진다.

예시

inventory/

components/

hooks/

pages/

services/

types/

utils/

index.ts

절대로 Feature끼리 직접 접근하지 않는다.

공통 로직은

common

또는

services

로 이동한다.

---

# ROUTING

React Router 사용

Public Routes

Landing

Login

Signup

Protected Routes

Dashboard

Calendar

Inventory

Analytics

Notification

Settings

Profile

404

---

# LAYOUT

App Layout

Top Navigation

Main Content

Floating Action Button

Bottom Navigation (Mobile)

Desktop Sidebar

---

# STATE MANAGEMENT

가능하면 React 기본 기능을 사용한다.

Local State

↓

Context

↓

Firebase

↓

React Query

순으로 사용한다.

Context API를 전역 저장소처럼 사용하지 않는다.

Server State는 React Query로 관리한다.

---

# REACT QUERY

Firestore 데이터를 캐싱한다.

자동 Refetch

Background Update

Loading State

Error State

모두 React Query가 담당한다.

---

# FOLDER RULE

한 파일은 하나의 역할만 가진다.

Component

↓

Hook

↓

Service

↓

Repository

↓

Firebase

의 흐름을 유지한다.

---

# FIREBASE

Authentication

Firestore

Cloud Functions

Cloud Messaging

Storage

Analytics

모두 사용할 수 있도록 구조를 만든다.

---

# FIRESTORE COLLECTIONS

users

product_db

user_items

prediction_logs

notifications

settings

categories

feedback

analytics

---

# USERS

uid

email

nickname

photoURL

createdAt

updatedAt

notificationEnabled

leadTime

theme

language

---

# PRODUCT_DB

name

brand

category

defaultCycle

importance

aliases

createdAt

updatedAt

---

# USER_ITEMS

itemId

userId

productId

customName

category

brand

importance

registeredAt

expectedEndDate

actualEndDate

lastPurchased

predictionVersion

status

---

# PREDICTION_LOGS

predictionId

itemId

expectedCycle

actualCycle

accuracy

modelVersion

createdAt

---

# NOTIFICATIONS

notificationId

userId

title

body

scheduledTime

sent

read

createdAt

---

# SETTINGS

notification

theme

language

leadTime

timezone

---

# ANALYTICS

monthlyUsage

categoryRatio

predictionAccuracy

averageCycle

fastestItem

slowestItem

---

# FIRESTORE RULES

사용자는

자신의 데이터만 읽을 수 있다.

자신의 데이터만 수정할 수 있다.

product_db는

읽기만 가능하다.

관리자만 수정 가능하다.

---

# DATABASE INDEX

userId

expectedEndDate

category

createdAt

notificationTime

위 필드는 Index를 생성한다.

---

# REPOSITORY PATTERN

UI

↓

Hook

↓

Service

↓

Repository

↓

Firestore

Repository는

Firestore만 안다.

Service는

Business Logic만 안다.

UI는

Service만 안다.

---

# SERVICE LAYER

Inventory Service

Prediction Service

Notification Service

Analytics Service

Auth Service

Calendar Service

Product Service

---

# API DESIGN

Auth

login

logout

signup

deleteAccount

Inventory

createItem

updateItem

deleteItem

getItems

Prediction

predictEndDate

updatePrediction

calculateCycle

Notification

scheduleNotification

cancelNotification

Analytics

getStatistics

---

# TYPE SCRIPT

interface보다

type을 우선 사용한다.

모든 데이터는

명확한 타입을 가진다.

any 사용 금지.

unknown 우선.

---

# ENVIRONMENT VARIABLES

Firebase

OpenAI

Vercel

Cloud Functions

환경변수는

.env.local

에서 관리한다.

API Key를 코드에 작성하지 않는다.

---

# ERROR HANDLING

모든 Service는

try-catch를 사용한다.

사용자에게

기술적인 에러를 노출하지 않는다.

---

# PREDICTION ENGINE

Prediction Engine은
Re:Fill의 핵심 기능이다.

Prediction Engine은

UI

Firebase

React

에 의존하지 않는다.

하나의 독립적인 Domain으로 설계한다.

향후

Machine Learning

또는

다른 AI 모델

로 교체할 수 있어야 한다.

Prediction Engine은

입력

↓

분석

↓

예측

↓

검증

↓

학습

↓

결과 반환

의 순서로 동작한다.

---

# PREDICTION FLOW

물건 등록

↓

제품 DB 조회

↓

표준 사용 주기 확인

↓

사용자 설정 확인

↓

기존 소비 기록 조회

↓

예상 소진일 계산

↓

달력 업데이트

↓

알림 예약

↓

실제 사용 종료

↓

예측 정확도 계산

↓

Prediction Engine 업데이트

---

# PREDICTION STRATEGY

모든 제품을 동일하게 계산하지 않는다.

제품 유형에 따라
예측 방식을 다르게 적용한다.

---

TYPE A

정량 소비형

예시

면도날

칫솔

캡슐커피

마스크

건전지

휴지

수량이 정해진 물건

↓

사용기간 계산

↓

정확도가 높음

---

TYPE B

주기 소비형

예시

샴푸

린스

바디워시

세제

폼클렌징

사용량이 사람마다 다름

↓

표준값으로 시작

↓

개인 기록이 쌓일수록

사용자 비중 증가

---

TYPE C

불규칙 소비형

예시

간식

음료

과자

이클립스

사용 패턴이 일정하지 않음

↓

AI 비중 증가

↓

최근 소비 패턴 반영

---

# PRODUCT DATABASE

제품 DB는

Prediction Engine의 기준이 된다.

DB에는

제품명

브랜드

카테고리

표준 사용기간

중요도

별칭

평균 소비량

추천 Lead Time

이 저장된다.

---

# PRODUCT MATCHING

사용자가

"헤드앤숄더"

를 입력하면

제품명을 그대로 비교하지 않는다.

별칭

브랜드

유사 이름

카테고리

모두 비교한다.

유사도 기반 매칭을 수행한다.

---

# OPENAI POLICY

OpenAI는

최후의 수단이다.

항상

1

Product DB

↓

2

Cache

↓

3

OpenAI

순서로 조회한다.

OpenAI를

첫 번째로 호출하지 않는다.

---

# OPENAI TASK

OpenAI는

사용기간을 추정하는 용도로만 사용한다.

Firestore CRUD

검색

정렬

계산

은 하지 않는다.

---

# OPENAI RESPONSE

항상

JSON으로 응답한다.

자유로운 문장을 반환하지 않는다.

예시

{
"estimatedDays": 45,
"confidence": 0.91,
"reason":"..."
}

---

# PROMPT ENGINEERING

항상

System Prompt

Developer Prompt

User Prompt

를 분리한다.

Prompt는

재사용 가능하게 작성한다.

---

# CACHE STRATEGY

이미 계산한 제품은

Firestore에 저장한다.

같은 제품이면

OpenAI를 다시 호출하지 않는다.

---

# PERSONALIZATION

Prediction Engine은

처음에는

제품 평균값을 사용한다.

사용 기록이 쌓일수록

사용자 데이터 비중을 증가시킨다.

예시

초기

제품 DB 100%

5회 사용

DB 70%

User 30%

10회 사용

DB 50%

User 50%

20회 이상

DB 20%

User 80%

---

# ACCURACY SCORE

Prediction Engine은

항상

예측 정확도를 계산한다.

예시

예측

30일

실제

32일

오차

2일

Accuracy 계산

Prediction Log 저장

---

# SELF LEARNING

새로운 소비 기록이 들어오면

Prediction Engine은

기존 예측을 수정한다.

학습은

사용자 단위로 수행한다.

다른 사용자에게

영향을 주지 않는다.

---

# LEAD TIME

사용자는

배송 소요일을 설정할 수 있다.

예시

쿠팡

1일

일반 쇼핑몰

3일

해외배송

7일

알림은

소진일이 아니라

Lead Time을 고려하여 발송한다.

---

# NOTIFICATION LOGIC

오늘 날짜

↓

소진 예정일 확인

↓

Lead Time 계산

↓

예약 알림 생성

↓

푸시 발송

---

# RECALCULATION

아래 경우에는

예측을 다시 계산한다.

물건 수정

사용 완료

중요도 변경

제품 변경

Lead Time 변경

---

# ANALYTICS

Prediction Engine은

다음 데이터를 생성한다.

예측 정확도

평균 소비 기간

재주문 횟수

카테고리별 소비

월별 소비량

---

# FUTURE ML

Prediction Engine은

향후

ML 모델로 교체 가능해야 한다.

PredictionService의

인터페이스는 유지한다.

내부 구현만 변경 가능해야 한다.

---

# AI COST

항상

운영 비용을 최소화한다.

불필요한 OpenAI 호출 금지

중복 호출 금지

동일 제품 재계산 금지

캐시 적극 활용

---

# FAIL SAFE

OpenAI가 실패하면

서비스가 중단되지 않는다.

대신

제품 DB 평균값으로

자동 대체한다.

---

# BUSINESS RULE

Prediction Engine은

항상

사용자 경험을 우선한다.

정확도가 조금 낮더라도

빠르고

안정적으로

동작해야 한다.

서비스가 느려지는 AI는

좋은 AI가 아니다.

---

# FINAL GOAL

Re:Fill은

'물건 관리 앱'이 아니다.

생활 소비를 예측하는

AI 플랫폼이다.

모든 코드와 기능은

이 목표를 중심으로 설계한다.