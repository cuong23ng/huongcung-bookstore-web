#!/usr/bin/env node

/**
 * Verification script for Story 0.1: Testing Infrastructure Setup
 * 
 * This script verifies that all testing infrastructure components are properly configured.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = __dirname

const checks = []
let passed = 0
let failed = 0

function check(name, condition, message) {
  checks.push({ name, condition, message })
  if (condition) {
    console.log(`✅ ${name}: ${message}`)
    passed++
  } else {
    console.log(`❌ ${name}: ${message}`)
    failed++
  }
}

console.log('🧪 Verifying Testing Infrastructure Setup...\n')

// Check 1: package.json exists and has test dependencies
try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'))
  
  check(
    'Package.json exists',
    true,
    'package.json found'
  )
  
  const requiredDeps = [
    'vitest',
    '@vitest/ui',
    '@vitest/coverage-v8',
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    'jsdom'
  ]
  
  const devDeps = packageJson.devDependencies || {}
  requiredDeps.forEach(dep => {
    check(
      `Dependency: ${dep}`,
      dep in devDeps,
      dep in devDeps ? `Found in devDependencies` : `Missing from devDependencies`
    )
  })
  
  // Check test scripts
  const scripts = packageJson.scripts || {}
  check(
    'Test script exists',
    'test' in scripts && scripts.test === 'vitest',
    'test script configured'
  )
  check(
    'Test:ui script exists',
    'test:ui' in scripts && scripts['test:ui'] === 'vitest --ui',
    'test:ui script configured'
  )
  check(
    'Test:run script exists',
    'test:run' in scripts && scripts['test:run'] === 'vitest run',
    'test:run script configured'
  )
  check(
    'Test:coverage script exists',
    'test:coverage' in scripts && scripts['test:coverage'] === 'vitest run --coverage',
    'test:coverage script configured'
  )
} catch (error) {
  check('Package.json', false, `Error reading package.json: ${error.message}`)
}

// Check 2: vitest.config.ts exists
check(
  'Vitest config file',
  existsSync(join(projectRoot, 'vitest.config.ts')),
  'vitest.config.ts exists'
)

// Check 3: Test setup file exists
check(
  'Test setup file',
  existsSync(join(projectRoot, 'src', 'test', 'setup.ts')),
  'src/test/setup.ts exists'
)

// Check 4: Test utilities file exists
check(
  'Test utilities file',
  existsSync(join(projectRoot, 'src', 'test', 'utils.tsx')),
  'src/test/utils.tsx exists'
)

// Check 5: Example test files exist
check(
  'Example test file',
  existsSync(join(projectRoot, 'src', 'test', 'example.test.ts')),
  'src/test/example.test.ts exists'
)

check(
  'Component test example',
  existsSync(join(projectRoot, 'src', 'components', 'Example.test.tsx')),
  'src/components/Example.test.tsx exists'
)

check(
  'Service test example',
  existsSync(join(projectRoot, 'src', 'services', 'Example.test.ts')),
  'src/services/Example.test.ts exists'
)

check(
  'React Query test',
  existsSync(join(projectRoot, 'src', 'test', 'react-query.test.tsx')),
  'src/test/react-query.test.tsx exists'
)

// Check 6: Verify vitest.config.ts content
try {
  const vitestConfig = readFileSync(join(projectRoot, 'vitest.config.ts'), 'utf-8')
  
  check(
    'Vitest config has React plugin',
    vitestConfig.includes('@vitejs/plugin-react-swc') || vitestConfig.includes('@vitejs/plugin-react'),
    'React plugin configured'
  )
  
  check(
    'Vitest config has jsdom environment',
    vitestConfig.includes("environment: 'jsdom'"),
    'jsdom environment configured'
  )
  
  check(
    'Vitest config has setup file',
    vitestConfig.includes('./src/test/setup.ts'),
    'Setup file path configured'
  )
  
  check(
    'Vitest config has path alias',
    vitestConfig.includes("'@':") || vitestConfig.includes('"@":'),
    'Path alias @ configured'
  )
  
  check(
    'Vitest config has coverage provider',
    vitestConfig.includes("provider: 'v8'") || vitestConfig.includes('provider: "v8"'),
    'Coverage provider v8 configured'
  )
} catch (error) {
  check('Vitest config content', false, `Error reading vitest.config.ts: ${error.message}`)
}

// Check 7: Verify test setup file content
try {
  const setupFile = readFileSync(join(projectRoot, 'src', 'test', 'setup.ts'), 'utf-8')
  
  check(
    'Setup file imports jest-dom',
    setupFile.includes('@testing-library/jest-dom'),
    'jest-dom imported'
  )
  
  check(
    'Setup file has cleanup',
    setupFile.includes('cleanup') || setupFile.includes('afterEach'),
    'Cleanup configured'
  )
} catch (error) {
  check('Setup file content', false, `Error reading setup.ts: ${error.message}`)
}

// Check 8: Verify test utilities content
try {
  const utilsFile = readFileSync(join(projectRoot, 'src', 'test', 'utils.tsx'), 'utf-8')
  
  check(
    'Utils file has renderWithProviders',
    utilsFile.includes('renderWithProviders'),
    'renderWithProviders function exists'
  )
  
  check(
    'Utils file has QueryClient',
    utilsFile.includes('QueryClient'),
    'React Query support configured'
  )
  
  check(
    'Utils file disables retry',
    utilsFile.includes('retry: false'),
    'Query retry disabled for tests'
  )
} catch (error) {
  check('Utils file content', false, `Error reading utils.tsx: ${error.message}`)
}

// Check 9: TypeScript config includes test files
try {
  const tsconfigContent = readFileSync(join(projectRoot, 'tsconfig.app.json'), 'utf-8')
  // Remove comments for JSON parsing (TypeScript configs support comments)
  const jsonContent = tsconfigContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
  const tsconfig = JSON.parse(jsonContent)
  const includes = tsconfig.include || []
  
  check(
    'TypeScript includes test files',
    includes.some(inc => inc.includes('test')),
    'Test files included in TypeScript config'
  )
} catch (error) {
  // Fallback: check if file contains test in include array as string
  try {
    const tsconfigContent = readFileSync(join(projectRoot, 'tsconfig.app.json'), 'utf-8')
    const hasTestInclude = tsconfigContent.includes('test') && tsconfigContent.includes('include')
    check(
      'TypeScript includes test files',
      hasTestInclude,
      hasTestInclude ? 'Test files included in TypeScript config' : 'Test files not found in includes'
    )
  } catch (e) {
    check('TypeScript config', false, `Error reading tsconfig.app.json: ${error.message}`)
  }
}

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Verification Summary')
console.log('='.repeat(60))
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📝 Total Checks: ${checks.length}`)
console.log('='.repeat(60))

if (failed === 0) {
  console.log('\n🎉 All checks passed! Testing infrastructure is properly configured.')
  console.log('\nNext steps:')
  console.log('1. Run: npm install (if dependencies not installed)')
  console.log('2. Run: npm run test:run (to verify tests execute)')
  console.log('3. Run: npm run test:coverage (to verify coverage reporting)')
  process.exit(0)
} else {
  console.log('\n⚠️  Some checks failed. Please review the errors above.')
  process.exit(1)
}

