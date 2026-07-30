/**
 * 카카오 최초 1회 인증 스크립트.
 *
 * 실행: node scripts/kakao/kakaoAuth.mjs [--save-to-firestore <uid>] [--no-browser]
 *
 * 동작
 *  1. 로컬에 임시 HTTP 서버(기본 http://localhost:3000)를 띄운다.
 *  2. 브라우저로 카카오 동의 화면을 연다 (scope=talk_message).
 *  3. 리다이렉트로 돌아온 인가 코드를 받아 액세스/리프레시 토큰으로 교환한다.
 *  4. scripts/kakao/.token.local.json 에 저장한다.
 *
 * --save-to-firestore <uid> 를 주면 Cloud Functions 테스트용으로
 * refresh token 을 kakao_tokens/{uid} 문서에도 기록한다.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { PROJECT_ROOT, TOKEN_FILE, loadKakaoEnv } from './env.mjs';
import { buildAuthorizeUrl, describeKakaoError, exchangeCodeForToken } from './kakaoApi.mjs';
import { writeStoredToken } from './tokenStore.mjs';

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' };

function renderPage(title, message, tone) {
  const color = tone === 'error' ? '#dc2626' : '#16a34a';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:system-ui,-apple-system,'Malgun Gothic',sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc">
<div style="text-align:center;padding:32px 48px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08)">
<h1 style="color:${color};font-size:20px;margin:0 0 8px">${title}</h1>
<p style="color:#475569;font-size:14px;margin:0">${message}</p>
</div></body></html>`;
}

function parseArgs(argv) {
  const noBrowser = argv.includes('--no-browser');

  const flagIndex = argv.indexOf('--save-to-firestore');
  if (flagIndex === -1) return { firestoreUid: null, noBrowser };

  const uid = argv[flagIndex + 1];
  if (!uid || uid.startsWith('--')) {
    console.error('❌ --save-to-firestore 뒤에 대상 사용자 uid 를 지정해야 합니다.');
    process.exit(1);
  }
  return { firestoreUid: uid, noBrowser };
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      // start 는 cmd 내장 명령이라 cmd 를 거쳐야 하고, 첫 인자는 창 제목으로 소비된다.
      // ⚠️ cmd 는 따옴표 밖의 & 를 명령 구분자로 해석하므로, URL 을 반드시 따옴표로 감싸야 한다.
      //    감싸지 않으면 첫 & 앞에서 URL 이 잘려 response_type 등이 사라지고 KOE201 이 발생한다.
      //    Node 는 & 만으로는 자동 인용하지 않으므로 windowsVerbatimArguments 로 직접 인용한다.
      spawn('cmd', ['/c', 'start', '""', `"${url}"`], {
        detached: true,
        stdio: 'ignore',
        windowsVerbatimArguments: true,
      }).unref();
    } else if (process.platform === 'darwin') {
      // open/xdg-open 은 셸을 거치지 않으므로 & 를 그대로 전달해도 안전하다.
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch {
    // 자동 실행이 실패해도 URL 을 직접 열면 되므로 치명적이지 않다.
  }
}

/** 인가 코드를 받을 때까지 대기하는 임시 서버 */
function waitForAuthorizationCode({ redirectUri, expectedState }) {
  const url = new URL(redirectUri);
  const port = Number(url.port || 80);

  return new Promise((resolvePromise, rejectPromise) => {
    /**
     * 응답이 완전히 전송된 뒤에 서버를 닫는다.
     * keep-alive 연결이 남은 채로 프로세스를 종료하면 Windows 에서 libuv assertion 이 발생한다.
     */
    const shutdown = (server, done) => {
      server.closeAllConnections?.();
      server.close(() => done());
    };

    const server = createServer((req, res) => {
      const requestUrl = new URL(req.url, `http://${req.headers.host}`);
      if (requestUrl.pathname !== url.pathname) {
        res.writeHead(404, HTML_HEADERS);
        res.end(
          renderPage(
            '요청 경로가 아닙니다',
            `${url.pathname} 로 리다이렉트되어야 합니다.`,
            'error',
          ),
        );
        return;
      }

      const error = requestUrl.searchParams.get('error');
      const code = requestUrl.searchParams.get('code');
      const state = requestUrl.searchParams.get('state');

      const fail = (title, message) => {
        res.writeHead(400, HTML_HEADERS);
        res.end(renderPage(title, message, 'error'), () => {
          shutdown(server, () => rejectPromise(new Error(`${title} - ${message}`)));
        });
      };

      if (error) {
        fail('인증이 취소되었습니다', requestUrl.searchParams.get('error_description') || error);
        return;
      }
      if (state !== expectedState) {
        fail('state 불일치', 'CSRF 방지용 state 값이 일치하지 않습니다. 다시 실행하세요.');
        return;
      }
      if (!code) {
        fail('인가 코드 없음', '응답에 code 파라미터가 없습니다.');
        return;
      }

      res.writeHead(200, HTML_HEADERS);
      res.end(
        renderPage('카카오 인증 완료', '이 창을 닫고 터미널로 돌아가세요.', 'success'),
        () => {
          shutdown(server, () => resolvePromise(code));
        },
      );
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        rejectPromise(
          new Error(
            `포트 ${port} 가 이미 사용 중입니다. 해당 프로세스를 종료하거나 KAKAO_REDIRECT_URI 로 다른 포트를 지정하세요.`,
          ),
        );
        return;
      }
      rejectPromise(err);
    });

    server.listen(port, '127.0.0.1');
  });
}

/** Cloud Functions 테스트용으로 refresh token 을 Firestore 에 저장한다. */
async function saveRefreshTokenToFirestore(uid, stored) {
  const require = createRequire(resolve(PROJECT_ROOT, 'functions', 'package.json'));

  let initializeApp;
  let getFirestore;
  let FieldValue;
  try {
    ({ initializeApp } = require('firebase-admin/app'));
    ({ getFirestore, FieldValue } = require('firebase-admin/firestore'));
  } catch {
    console.error(
      [
        '',
        '❌ firebase-admin 을 찾을 수 없습니다. functions 의존성을 먼저 설치하세요.',
        '     cd functions && npm install',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'refill-7ec10';
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  initializeApp({ projectId });
  await getFirestore().collection('kakao_tokens').doc(uid).set(
    {
      refreshToken: stored.refresh_token,
      scope: stored.scope,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(
    `✅ kakao_tokens/${uid} 에 refresh token 저장 완료 (${emulatorHost ? `에뮬레이터 ${emulatorHost}` : `실제 프로젝트 ${projectId}`})`,
  );
}

async function main() {
  const { firestoreUid, noBrowser } = parseArgs(process.argv.slice(2));
  const { restApiKey, clientSecret, redirectUri } = loadKakaoEnv();

  const state = randomUUID();
  const authorizeUrl = buildAuthorizeUrl({ restApiKey, redirectUri, state });

  console.log('\n🔑 카카오 인증을 시작합니다.');
  console.log(`   Redirect URI: ${redirectUri}`);
  console.log(
    '   (이 값이 카카오 개발자 콘솔 > 카카오 로그인 > Redirect URI 에 등록되어 있어야 합니다)\n',
  );
  console.log('   브라우저가 자동으로 열리지 않으면 아래 주소를 직접 열어주세요.\n');
  console.log(`   ${authorizeUrl}\n`);

  const codePromise = waitForAuthorizationCode({ redirectUri, expectedState: state });
  if (!noBrowser) openBrowser(authorizeUrl);

  const code = await codePromise;
  console.log('   인가 코드 수신 완료. 토큰으로 교환하는 중...');

  const tokenResponse = await exchangeCodeForToken({ restApiKey, clientSecret, redirectUri, code });
  const stored = writeStoredToken(tokenResponse);

  console.log(`\n✅ 토큰 발급 완료 → ${TOKEN_FILE}`);
  console.log(`   scope: ${stored.scope || '(응답 없음)'}`);
  console.log(
    `   액세스 토큰 만료: ${new Date(stored.access_token_expires_at).toLocaleString('ko-KR')}`,
  );

  if (!stored.scope.includes('talk_message')) {
    console.warn(
      [
        '',
        '⚠️  발급된 스코프에 talk_message 가 없습니다. 이대로는 메시지를 보낼 수 없습니다.',
        '   카카오 개발자 콘솔 > 카카오 로그인 > 동의항목에서',
        '   [접근권한] "카카오톡 메시지 전송"을 "이용 중 동의"로 설정한 뒤 다시 실행하세요.',
      ].join('\n'),
    );
  }

  if (firestoreUid) {
    await saveRefreshTokenToFirestore(firestoreUid, stored);
  }

  console.log('\n다음 단계: node scripts/kakao/sendKakaoToMe.mjs\n');
}

main().catch((error) => {
  console.error(`\n❌ ${describeKakaoError(error)}\n`);
  // process.exit() 대신 exitCode 만 설정해 남은 핸들이 정상적으로 정리되도록 한다.
  process.exitCode = 1;
});
