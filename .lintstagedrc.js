module.exports = {
  // Frontend TypeScript/TSX files
  'apps/web/**/*.{ts,tsx}': [
    // Full TypeScript project check (ignores file arguments)
    () => 'cd apps/web && npm run typecheck',
    // ESLint with fix
    'eslint --fix --max-warnings=0',
  ],
  // Backend JavaScript files
  'backend/**/*.js': [
    'eslint --fix',
  ],
  // JSON, Markdown, CSS files
  '*.{json,md,css}': [
    'prettier --write --ignore-unknown',
  ],
}
