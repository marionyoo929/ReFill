# Development Workflow

이 프로젝트는 실제 서비스 출시를 목표로 개발한다.

공모전 제출용 데모가 아니라 유지보수성과 확장성을 고려한 Production 수준의 프로젝트를 구현한다.

모든 개발은 아래 Workflow를 반드시 따른다.

---

# 1. Planning First

절대로 바로 코드를 작성하지 않는다.

새로운 기능을 구현하기 전에 반드시 다음 내용을 먼저 설명한다.

- 이번 단계의 목표
- 왜 필요한 기능인지
- 구현 방식
- 생성할 파일 목록
- 수정할 파일 목록
- 기존 구조에 미치는 영향

설명이 끝난 후 구현을 시작한다.

---

# 2. Todo Management

새로운 Feature를 구현하기 전에 반드시 Todo List를 생성한다.

Todo는 체크리스트 형태로 작성한다.

예시

## Todo

- [ ] Dashboard UI
- [ ] Firestore 연결
- [ ] Inventory CRUD
- [ ] Prediction Engine
- [ ] Notification

Todo 없이 구현을 시작하지 않는다.

---

# 3. One Feature Rule

한 번에 하나의 Feature만 구현한다.

Feature가 완료되기 전에는 다른 Feature를 건드리지 않는다.

Feature Complete 상태를 만든 후 다음 Feature로 진행한다.

예시

Dashboard 완료

↓

Calendar 완료

↓

Inventory 완료

↓

Prediction 완료

↓

Notification 완료

↓

Analytics 완료

---

# 4. Progress Management

항상 현재 프로젝트 진행 상황을 표시한다.

예시

Project Progress

██████░░░░ 60%

Completed

- Authentication
- Dashboard
- Calendar

Current

- Inventory

Next

- Prediction Engine

---

# 5. Architecture Protection

기존 프로젝트 구조를 임의로 변경하지 않는다.

새로운 폴더 또는 새로운 구조가 필요하다면 먼저 아래 내용을 설명한다.

- 변경 이유
- 장점
- 단점
- 기존 구조와의 차이
- 변경 후 영향

사용자의 승인 없이 프로젝트 구조를 변경하지 않는다.

---

# 6. Coding Process

기능 구현은 아래 순서를 반드시 따른다.

Planning

↓

Implementation

↓

Self Review

↓

Testing

↓

Report

↓

Next Feature

절대로 여러 단계를 생략하지 않는다.

---

# 7. Completion Report

Feature 하나가 완료될 때마다 반드시 아래 형식으로 보고한다.

## ✅ Completed Feature

완료한 기능 설명

---

## 📂 Created Files

생성한 파일 목록

---

## ✏ Modified Files

수정한 파일 목록

---

## 🧪 Test Checklist

- 기능 정상 동작
- TypeScript 오류 없음
- ESLint 오류 없음
- UI 정상 출력
- 반응형 확인
- 기존 기능 영향 없음

---

## ⚠ Known Issues

현재 발견된 문제

없다면

"없음"

---

## 💡 Improvement Ideas

향후 개선 가능한 내용

---

## ▶ Next Feature

다음 구현 예정 기능

---

# 8. Self Review

구현이 끝난 후 반드시 스스로 검토한다.

다음 항목을 확인한다.

- 코드 중복 여부
- 불필요한 코드 존재 여부
- 성능 문제
- 메모리 낭비
- 유지보수성
- 확장성
- 보안 문제
- 가독성

문제가 있다면 먼저 수정한 후 완료를 보고한다.

---

# 9. Documentation

새로운 기능이 추가되면 필요한 경우 아래 문서를 함께 업데이트한다.

- README
- docs
- API 문서
- Database 문서

문서와 코드의 내용이 항상 일치하도록 유지한다.

---

# 10. Quality Rules

아래 조건을 만족해야만 Feature를 완료로 인정한다.

- 정상 동작
- TypeScript 오류 없음
- ESLint 오류 없음
- Hard Coding 최소화
- any 사용 금지
- 코드 중복 없음
- Production 수준 품질 유지
- 반응형 지원
- 에러 처리 구현
- Loading 상태 구현
- Empty State 구현

---

# 11. Communication Rules

항상 현재 작업 내용을 명확하게 설명한다.

작업 중 막히는 부분이 있으면 임의로 구현하지 말고 먼저 사용자에게 설명한다.

불확실한 요구사항은 반드시 질문한 후 진행한다.

---

# 12. Production Mindset

항상 아래 우선순위를 유지한다.

1. 안정성
2. 유지보수성
3. 확장성
4. 성능
5. 보안
6. 사용자 경험(UI/UX)
7. 운영 비용

단순히 동작하는 코드가 아니라 실제 서비스에 배포 가능한 품질을 목표로 구현한다.

---

# 13. Final Principle

이 프로젝트의 목표는

"필요하기 전에, 먼저 채우다."

라는 Re:Fill의 브랜드 철학을 구현하는 것이다.

모든 코드와 UI는 이 철학을 반영해야 한다.

항상 프로젝트 전체를 고려하여 개발하고, 부분적인 최적화보다 일관성과 확장성을 우선한다.