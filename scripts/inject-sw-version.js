#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get git commit hash
const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    console.warn('Could not get git hash, using fallback');
    return 'dev';
  }
};

// Get build timestamp
const getBuildTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
};

// Generate version string
const generateVersion = () => {
  const hash = getGitHash();
  const timestamp = getBuildTimestamp();
  return `v1-${hash}-${timestamp}`;
};

// Inject version into service worker
const injectVersion = () => {
  const swPath = join(__dirname, '../dist/service-worker.js');
  const version = generateVersion();

  try {
    let content = readFileSync(swPath, 'utf8');

    // Replace the placeholder with actual version
    content = content.replace(
      /const CACHE_VERSION = ".*?";/,
      `const CACHE_VERSION = "${version}";`
    );

    writeFileSync(swPath, content, 'utf8');
    console.log(`✓ Service worker version injected: ${version}`);
  } catch (error) {
    console.error('Error injecting service worker version:', error.message);
    process.exit(1);
  }
};

injectVersion();
