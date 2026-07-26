import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EnvErrorScreen } from '@/components/common/EnvErrorScreen';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('루트 엘리먼트를 찾을 수 없습니다.');
}

const root = createRoot(rootElement);

// App(및 그 하위 모듈인 Firebase 초기화/환경 변수 검증)을 동적 import로 불러와서,
// 모듈 최상위에서 발생하는 에러(예: 환경 변수 누락)도 여기서 잡아 명확한 오류 화면을 보여준다.
import('@/app/App')
  .then(({ App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error('앱 초기화에 실패했습니다.', error);
    root.render(
      <StrictMode>
        <EnvErrorScreen error={error} />
      </StrictMode>,
    );
  });
