import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'functions/lib', 'node_modules'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      jsxA11y.flatConfigs.recommended,
      prettierConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // 라우터 설정 파일은 lazy-loaded 컴포넌트 참조를 다수 보관하지만
    // 컴포넌트 자체를 export하지 않으므로 Fast Refresh 규칙 대상이 아니다.
    files: ['src/routes/router.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Provider 파일은 Context Provider 컴포넌트와 짝을 이루는 useXxx 훅을
    // 함께 export하는 것이 표준 패턴이므로 Fast Refresh 규칙 대상이 아니다.
    files: ['src/providers/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
