import {defineConfig,globalIgnores} from 'eslint/config';
import parser from '@typescript-eslint/parser';
import hooks from 'eslint-plugin-react-hooks';
export default defineConfig([
 globalIgnores(['.next/**','.vercel/**','docs/**','node_modules/**','next-env.d.ts']),
 {files:['**/*.ts','**/*.tsx'],languageOptions:{parser,parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}}},plugins:{'react-hooks':hooks},rules:{'react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'error'}}
]);
