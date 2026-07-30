# 카카오톡 "나에게 보내기" 연동

Re:Fill 의 소진 임박 알림을 **내 핸드폰 카카오톡으로 실제 발송**하기 위한 스크립트다.
Cloud Functions(`functions/src/kakao/`)에 들어간 로직과 동일한 흐름을 독립 실행으로 검증한다.

> ⚠️ **핸드폰에 로그인된 카카오톡 계정 = 카카오 개발자 콘솔 계정**이어야 한다.
> "나에게 보내기"는 앱 멤버 본인에게만 발송되기 때문이다.
> (친구에게 보내기는 비즈앱 전환 + 검수가 필요하지만, 나에게 보내기는 검수가 필요 없다.)

---

## 1. 카카오 개발자 콘솔 설정

https://developers.kakao.com

1. **내 애플리케이션 > 애플리케이션 추가하기** — 앱 이름 `Re:Fill`
2. **앱 키** 탭 → `REST API 키` 복사
3. **카카오 로그인** → 활성화 상태 **ON**
4. **카카오 로그인 > Redirect URI** 에 아래 값 등록 (한 글자도 달라선 안 됨)
   ```
   http://localhost:3000/oauth/kakao
   ```
5. **카카오 로그인 > 동의항목** → `[접근권한] 카카오톡 메시지 전송` 을 **"이용 중 동의"** 로 설정
6. (선택) **보안 > Client Secret** 을 "사용"으로 켰다면 그 값도 복사

## 2. 키 설정

`functions/.env.local` 파일을 만들고(없으면 `functions/.env.example` 복사) 값을 채운다.

```dotenv
KAKAO_REST_API_KEY=여기에_REST_API_키
KAKAO_CLIENT_SECRET=       # Client Secret 을 켠 경우에만
```

이 파일은 `.gitignore` 대상이며, Cloud Functions 에뮬레이터도 같은 파일을 읽는다.

## 3. 최초 인증 (1회)

```bash
node scripts/kakao/kakaoAuth.mjs
```

브라우저가 열리면 카카오 로그인 → 동의 → "카카오 인증 완료" 화면이 뜬다.
토큰은 `scripts/kakao/.token.local.json` 에 저장된다.

> 🔒 이 파일에는 60일간 유효한 refresh token 이 들어 있다. **절대 커밋하지 않는다** (`.gitignore` 등록됨).

## 4. 발송 테스트

```bash
# 기본 테스트 문구
node scripts/kakao/sendKakaoToMe.mjs

# 임의 문구
node scripts/kakao/sendKakaoToMe.mjs "테스트입니다"

# Re:Fill 실제 알림 형태
node scripts/kakao/sendKakaoToMe.mjs --preset refill
```

성공하면 콘솔에 `result_code: 0` 이 찍히고, **핸드폰 카카오톡의 "나와의 채팅"** 에 메시지가 도착한다.

액세스 토큰(약 12시간)이 만료되어 있으면 refresh token 으로 자동 갱신한 뒤 발송한다.

## 5. Cloud Functions 테스트용 토큰 시딩

`functions` 의 `sendKakaoMemo` 함수는 refresh token 을 Firestore `kakao_tokens/{uid}` 에서 읽는다.
아래 명령으로 시드할 수 있다.

```bash
# 에뮬레이터에 시드 (권장)
cd functions && npm install && cd ..
# PowerShell:  $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/kakao/kakaoAuth.mjs --save-to-firestore <내-uid>
```

`FIRESTORE_EMULATOR_HOST` 를 지정하지 않으면 실제 프로젝트(`refill-7ec10`)에 기록하며,
이 경우 `GOOGLE_APPLICATION_CREDENTIALS` 또는 `gcloud auth application-default login` 자격이 필요하다.

---

## 자주 만나는 오류

| 증상                             | 원인 / 해결                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `KOE006` / `redirect_uri` 불일치 | 콘솔에 등록한 Redirect URI 와 `KAKAO_REDIRECT_URI` 가 다름                          |
| 코드 `-402` (권한 부족)          | 동의항목에서 `카카오톡 메시지 전송`이 꺼져 있음 → 켠 뒤 `kakaoAuth.mjs` 재실행      |
| 코드 `-401` (토큰 무효)          | refresh token 만료(60일) 또는 연결 해제 → `kakaoAuth.mjs` 재실행                    |
| 발송은 성공인데 메시지가 안 옴   | 개발자 콘솔 계정과 폰 카카오톡 계정이 다름                                          |
| `포트 3000 이 이미 사용 중`      | 해당 프로세스 종료 또는 `KAKAO_REDIRECT_URI` 로 다른 포트 지정 (콘솔에도 같이 등록) |

## 파일 구성

| 파일                      | 역할                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| `env.mjs`                 | `functions/.env.local` 에서 키 로드                                          |
| `kakaoApi.mjs`            | 카카오 REST API 래퍼 (`functions/src/kakao/kakaoClient.ts` 의 원형)          |
| `tokenStore.mjs`          | `.token.local.json` 저장/조회, 만료 판정                                     |
| `notificationMessage.mjs` | 알림 목록 → 본문 문구 (`functions/src/kakao/notificationMessage.ts` 의 원형) |
| `kakaoAuth.mjs`           | 최초 1회 OAuth 인증                                                          |
| `sendKakaoToMe.mjs`       | 실제 발송                                                                    |
