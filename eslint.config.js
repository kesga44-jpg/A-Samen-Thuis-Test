export default [{
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      AbortController: 'readonly',
      Blob: 'readonly',
      TextDecoder: 'readonly',
      TextEncoder: 'readonly',
      DOMParser: 'readonly',
      File: 'readonly',
      FileReader: 'readonly',
      FormData: 'readonly',
      URL: 'readonly',
      URLSearchParams: 'readonly',
      atob: 'readonly',
      btoa: 'readonly',
      caches: 'readonly',
      clearTimeout: 'readonly',
      console: 'readonly',
      crypto: 'readonly',
      document: 'readonly',
      fetch: 'readonly',
      globalThis: 'readonly',
      localStorage: 'readonly',
      module: 'readonly',
      navigator: 'readonly',
      self: 'readonly',
      setInterval: 'readonly',
      setTimeout: 'readonly',
      structuredClone: 'readonly',
      window: 'readonly'
    }
  },
  rules: {
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    'no-undef': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
  }
}];
