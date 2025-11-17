#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Required environment variables for backend
const REQUIRED_BACKEND_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CORS_ORIGIN',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_SUCCESS_URL',
  'STRIPE_CANCEL_URL',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'FRONTEND_URL',
];

// Check if .env file exists
function checkEnvFile(envPath, label) {
  log(`\n📁 Checking ${label}...`, 'blue');
  
  if (!fs.existsSync(envPath)) {
    log(`  ❌ .env file not found at ${envPath}`, 'red');
    log(`  💡 Copy .env.example to .env and fill in the values`, 'yellow');
    return false;
  }
  
  log(`  ✅ .env file found`, 'green');
  return true;
}

// Parse .env file
function parseEnvFile(envPath) {
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key.trim()] = value;
      }
    }
  });
  
  return env;
}

// Check required variables
function checkRequiredVars(env, requiredVars, label) {
  log(`\n🔍 Checking required ${label} variables...`, 'blue');
  
  let missingCount = 0;
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName].startsWith('your-')) {
      log(`  ❌ ${varName} is not set or using placeholder`, 'red');
      missing.push(varName);
      missingCount++;
    } else {
      log(`  ✅ ${varName} is set`, 'green');
    }
  });
  
  if (missingCount > 0) {
    log(`\n  ⚠️  ${missingCount} required variable(s) missing`, 'yellow');
    return false;
  }
  
  log(`\n  ✅ All required ${label} variables are set`, 'green');
  return true;
}

// Security checks
function checkSecurity(env) {
  log(`\n🔒 Running security checks...`, 'blue');
  
  let hasIssues = false;
  
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    log(`  ⚠️  JWT_SECRET is too short`, 'yellow');
    hasIssues = true;
  } else if (env.JWT_SECRET) {
    log(`  ✅ JWT_SECRET has sufficient length`, 'green');
  }
  
  if (env.NODE_ENV === 'production') {
    log(`  🚀 Running in PRODUCTION mode`, 'yellow');
  }
  
  return !hasIssues;
}

// Main function
function main() {
  log('╔════════════════════════════════════════════╗', 'blue');
  log('║  Environment Configuration Checker         ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');
  
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  
  if (!checkEnvFile(backendEnvPath, 'Backend .env')) {
    process.exit(1);
  }
  
  const backendEnv = parseEnvFile(backendEnvPath);
  const allValid = checkRequiredVars(backendEnv, REQUIRED_BACKEND_VARS, 'backend') && checkSecurity(backendEnv);
  
  log('\n' + '═'.repeat(50), 'blue');
  
  if (allValid) {
    log('\n✅ Environment configuration is valid!\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Environment configuration has issues!\n', 'red');
    process.exit(1);
  }
}

main();
