import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import boundaries from 'eslint-plugin-boundaries'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json']
      }
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'ui-components',
          pattern: '**/*.{ts,tsx}',
          basePattern: 'src/components/ui',
          capture: ['elementName'],
          mode: 'file'
        },
        {
          type: 'components',
          pattern: '*.{ts,tsx}',
          basePattern: 'src/components',
          capture: ['elementName'],
          mode: 'file'
        },
        {
          type: 'game',
          pattern: '*.{ts,tsx}',
          basePattern: 'src/game',
          capture: ['elementName'],
          mode: 'file'
        },
        {
          type: 'lib',
          pattern: '*.{ts,tsx}',
          basePattern: 'src/lib',
          capture: ['elementName'],
          mode: 'file'
        },
        {
          type: 'store',
          pattern: '*.{ts,tsx}',
          basePattern: 'src/stores',
          capture: ['elementName'],
          mode: 'file'
        },
        {
          type: 'styles',
          pattern: '*.css',
          basePattern: 'src',
          mode: 'file'
        },
        {
          type: 'app',
          pattern: '*.{ts,tsx}',
          basePattern: 'src',
          mode: 'file'
        }
      ],
      'boundaries/include': ['src/**/*.*'],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.app.json', './tsconfig.node.json']
        },
        node: true
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries
    },
    rules: {
      ...boundaries.configs.strict.rules,
      'boundaries/element-types': [
        2,
        {
          default: 'disallow',
          rules: [
            // App can import from anywhere
            {
              from: ['app'],
              allow: ['components', 'ui-components', 'game', 'lib', 'styles', 'app']
            },
            {
              from: ['store'],
              allow: ['game']
            },
            // Game logic can import from lib and components
            {
              from: ['game'],
              allow: ['game', 'lib', 'components', 'ui-components']
            },
            // Components can import from lib and game (for types)
            {
              from: ['components'],
              allow: ['lib', 'game', 'ui-components', 'store']
            },
            // UI components can only import from lib and components
            {
              from: ['ui-components'],
              allow: ['lib', 'components']
            },
            // Lib can only import from other lib modules
            {
              from: ['lib'],
              allow: ['lib']
            }
          ]
        }
      ],
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  }
)
