import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        browser: true,
        node: true,
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        mermaid: 'readonly',
        Prism: 'readonly',
        lunr: 'readonly',
        DOMParser: 'readonly',
        Event: 'readonly',
        setTimeout: 'readonly',
        bootstrap: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly'
      }
    }
  }
];