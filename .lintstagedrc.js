module.exports = {
  // Frontend TypeScript/TSX files
  'apps/web/**/*.{ts,tsx}': [
    // Full TypeScript project check (ignores file arguments)
    () => 'npm run typecheck --prefix apps/web',
    // Note: ESLint disabled until TypeScript parser is configured in .eslintrc.json
    // () => 'npm run lint --prefix apps/web -- --fix',
    // Prettier formatting
    'prettier --write',
  ],
  // Backend JavaScript files
  'backend/**/*.js': [
    () => 'npm run lint --prefix backend -- --fix',
    'prettier --write',
  ],
  // JSON, CSS files
  '*.{json,css}': [
    'prettier --write --ignore-unknown',
  ],
}
