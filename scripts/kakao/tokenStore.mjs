/**
 * 발급받은 카카오 토큰의 로컬 저장/조회.
 *
 * ⚠️ .token.local.json 에는 60일간 유효한 refresh token 이 들어간다.
 *    실질적인 자격증명이므로 절대 커밋하지 않는다(.gitignore 등록됨).
 */
import { chmodSync, readFileSync, writeFileSync } from 'node:fs';

import { TOKEN_FILE } from './env.mjs';

/**
 * @typedef {object} StoredToken
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {number} access_token_expires_at  액세스 토큰 만료 시각 (epoch ms)
 * @property {string} scope
 * @property {string} obtained_at
 */

/** @returns {StoredToken} */
export function readStoredToken() {
  let raw;
  try {
    raw = readFileSync(TOKEN_FILE, 'utf8');
  } catch {
    console.error(
      [
        '',
        '❌ 저장된 카카오 토큰이 없습니다.',
        '',
        '   먼저 아래 명령으로 최초 인증을 진행하세요.',
        '     node scripts/kakao/kakaoAuth.mjs',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  const parsed = JSON.parse(raw);
  if (!parsed.refresh_token) {
    console.error('❌ 토큰 파일에 refresh_token 이 없습니다. kakaoAuth.mjs 로 다시 인증하세요.');
    process.exit(1);
  }
  return parsed;
}

/**
 * 토큰 응답을 파일에 저장한다.
 *
 * 카카오는 refresh token 만료가 임박한 경우에만 새 refresh_token 을 내려주므로,
 * 응답에 refresh_token 이 없으면 기존 값을 유지한다.
 *
 * @param {object} tokenResponse 카카오 /oauth/token 응답
 * @param {StoredToken | null} previous 기존 저장값 (갱신 시)
 * @returns {StoredToken}
 */
export function writeStoredToken(tokenResponse, previous = null) {
  const stored = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token || previous?.refresh_token,
    access_token_expires_at: Date.now() + Number(tokenResponse.expires_in ?? 0) * 1000,
    scope: tokenResponse.scope || previous?.scope || '',
    obtained_at: new Date().toISOString(),
  };

  writeFileSync(TOKEN_FILE, `${JSON.stringify(stored, null, 2)}\n`, { mode: 0o600 });
  try {
    chmodSync(TOKEN_FILE, 0o600);
  } catch {
    // Windows 에서는 POSIX 권한이 의미 없으므로 실패해도 무시한다.
  }
  return stored;
}

/** 액세스 토큰이 만료되었거나 5분 이내에 만료되는지 여부 */
export function isAccessTokenExpiring(stored) {
  const FIVE_MINUTES = 5 * 60 * 1000;
  return !stored.access_token || Date.now() + FIVE_MINUTES >= (stored.access_token_expires_at ?? 0);
}
