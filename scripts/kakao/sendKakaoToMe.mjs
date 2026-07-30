/**
 * 카카오톡 "나에게 보내기" 실제 발송 테스트 스크립트.
 *
 * 사전 조건: node scripts/kakao/kakaoAuth.mjs 로 최초 인증이 끝나 있어야 한다.
 *
 * 사용법
 *   node scripts/kakao/sendKakaoToMe.mjs                  기본 테스트 문구 발송
 *   node scripts/kakao/sendKakaoToMe.mjs "보낼 문구"        임의 문구 발송
 *   node scripts/kakao/sendKakaoToMe.mjs --preset refill   Re:Fill 실제 알림 형태로 발송
 *
 * 액세스 토큰이 만료되었으면 refresh token 으로 자동 갱신한 뒤 발송한다.
 */
import { loadKakaoEnv } from './env.mjs';
import {
  TEXT_MAX_LENGTH,
  describeKakaoError,
  refreshAccessToken,
  sendMemoText,
} from './kakaoApi.mjs';
import { formatNotificationText } from './notificationMessage.mjs';
import { isAccessTokenExpiring, readStoredToken, writeStoredToken } from './tokenStore.mjs';

const DEFAULT_TEXT = '[Re:Fill] 카카오톡 연동 테스트 메시지입니다.';

/** --preset refill 로 발송할 샘플. 실제 NotificationItem 필드 구조를 그대로 따른다. */
const REFILL_PRESET_ITEMS = [
  { itemName: '세제', remainingDays: 0, type: 'today' },
  { itemName: '샴푸', remainingDays: 3, type: 'upcoming' },
  { itemName: '치약', remainingDays: 5, type: 'upcoming' },
];

function resolveText(argv) {
  const presetIndex = argv.indexOf('--preset');
  if (presetIndex !== -1) {
    const preset = argv[presetIndex + 1];
    if (preset !== 'refill') {
      console.error(`❌ 알 수 없는 preset: ${preset ?? '(없음)'} — 지원하는 값: refill`);
      process.exit(1);
    }
    return formatNotificationText(REFILL_PRESET_ITEMS);
  }

  const positional = argv.find((arg) => !arg.startsWith('--'));
  return positional || DEFAULT_TEXT;
}

/** 필요하면 액세스 토큰을 갱신하고, 유효한 토큰을 돌려준다. */
async function ensureAccessToken({ restApiKey, clientSecret }) {
  const stored = readStoredToken();

  if (!isAccessTokenExpiring(stored)) {
    return stored.access_token;
  }

  console.log('   액세스 토큰이 만료되어 갱신합니다...');
  const refreshed = await refreshAccessToken({
    restApiKey,
    clientSecret,
    refreshToken: stored.refresh_token,
  });

  // 카카오는 refresh token 만료가 임박할 때만 새 refresh_token 을 내려준다.
  const updated = writeStoredToken(refreshed, stored);
  if (refreshed.refresh_token) {
    console.log('   새 refresh token 도 함께 발급되어 저장했습니다.');
  }
  return updated.access_token;
}

async function main() {
  const env = loadKakaoEnv();

  let text = resolveText(process.argv.slice(2));
  if (text.length > TEXT_MAX_LENGTH) {
    console.warn(
      `⚠️  본문이 ${text.length}자로 카카오 text 템플릿 제한(${TEXT_MAX_LENGTH}자)을 넘어 잘라냅니다.`,
    );
    text = `${text.slice(0, TEXT_MAX_LENGTH - 1)}…`;
  }

  console.log('\n📨 나에게 보내기 발송\n');
  console.log('---------------- 본문 ----------------');
  console.log(text);
  console.log('--------------------------------------\n');

  const accessToken = await ensureAccessToken(env);
  const result = await sendMemoText(accessToken, {
    text,
    linkUrl: env.appUrl,
    buttonTitle: 'Re:Fill 열기',
  });

  console.log(`✅ 발송 성공 (result_code: ${result.result_code})`);
  console.log('   핸드폰 카카오톡의 "나와의 채팅"을 확인하세요.\n');
}

main().catch((error) => {
  console.error(`\n❌ ${describeKakaoError(error)}\n`);
  // process.exit() 대신 exitCode 만 설정해 남은 소켓 핸들이 정상적으로 정리되도록 한다.
  process.exitCode = 1;
});
