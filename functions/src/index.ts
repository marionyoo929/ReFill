import { initializeApp } from 'firebase-admin/app';

initializeApp();

// Prediction, Notification 등 각 Feature 구현 시 이곳에 Cloud Functions를 추가하고 export 한다.
// OpenAI 호출은 반드시 이 계층(Cloud Functions)에서만 수행하며 프론트엔드에서 직접 호출하지 않는다.
