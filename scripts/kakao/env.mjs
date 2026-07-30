/**
 * 카카오 연동 스크립트용 환경 변수 로더.
 *
 * 키는 functions/.env.local 을 단일 출처로 사용한다.
 * - 이미 .gitignore 의 `.env.local` 패턴에 걸려 있어 커밋 위험이 없고,
 * - Cloud Functions 에뮬레이터가 읽는 파일과 동일해서 키를 두 곳에 둘 필요가 없다.
 *
 * process.env 에 값이 있으면 그쪽을 우선한다(CI/일회성 실행 대응).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

/** ReFill 프로젝트 루트 (scripts/kakao 에서 두 단계 위) */
export const PROJECT_ROOT = resolve(SCRIPT_DIR, '..', '..');

/** 발급받은 토큰을 저장하는 로컬 파일. .gitignore 등록 필수. */
export const TOKEN_FILE = resolve(SCRIPT_DIR, '.token.local.json');

const ENV_FILE = resolve(PROJECT_ROOT, 'functions', '.env.local');

/**
 * 아주 단순한 .env 파서. dotenv 의존성을 추가하지 않기 위해 직접 구현한다.
 * KEY=VALUE 형태만 지원하며 앞뒤 따옴표는 제거한다.
 */
function parseEnvFile(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return {};
  }

  const parsed = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) parsed[key] = value;
  }
  return parsed;
}

/**
 * 카카오 설정을 읽어 반환한다. REST API 키가 없으면 안내 후 프로세스를 종료한다.
 *
 * @returns {{ restApiKey: string, clientSecret: string | undefined, redirectUri: string, appUrl: string }}
 */
export function loadKakaoEnv() {
  const fileEnv = parseEnvFile(ENV_FILE);
  const read = (key) => process.env[key] || fileEnv[key] || '';

  const restApiKey = read('KAKAO_REST_API_KEY');
  const clientSecret = read('KAKAO_CLIENT_SECRET');
  const redirectUri = read('KAKAO_REDIRECT_URI') || 'http://localhost:3000/oauth/kakao';
  const appUrl = read('KAKAO_LINK_URL') || 'http://localhost:5173';

  if (!restApiKey) {
    console.error(
      [
        '',
        '❌ KAKAO_REST_API_KEY 가 설정되지 않았습니다.',
        '',
        `   ${ENV_FILE} 파일에 아래 내용을 추가하세요.`,
        '',
        '     KAKAO_REST_API_KEY=<카카오 개발자 콘솔 > 내 애플리케이션 > 앱 키 > REST API 키>',
        '     # 카카오 로그인 > 보안 > Client Secret 을 "사용"으로 켠 경우에만 필요',
        '     KAKAO_CLIENT_SECRET=',
        '',
        '   자세한 콘솔 설정 순서는 scripts/kakao/README.md 를 참고하세요.',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  return { restApiKey, clientSecret: clientSecret || undefined, redirectUri, appUrl };
}
