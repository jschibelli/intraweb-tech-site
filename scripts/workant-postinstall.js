#!/usr/bin/env node
// Postinstall script to copy scripts and prompts to root directory
// This script runs from node_modules/@intraweb-technology/workant
const fs = require('fs');
const path = require('path');

console.log('[workant] Postinstall script starting...');
console.log('[workant] Current directory:', __dirname);
console.log('[workant] Process CWD:', process.cwd());
console.log('[workant] INIT_CWD:', process.env.INIT_CWD);

// Get the directory where this script is located
const packagePath = __dirname;
console.log('[workant] Package path:', packagePath);

// Helper function to check if a path contains node_modules anywhere in it
const hasNodeModulesSegment = (targetPath) => {
  const normalized = path.normalize(targetPath);
  const parts = normalized.split(path.sep);
  return parts.includes('node_modules');
};

// Find the repository root by climbing completely out of node_modules
// and then finding the first package.json that is NOT inside node_modules
let currentPath = packagePath;
let rootPath = null;

// Step 1: Climb completely out of ALL node_modules directories
// Keep going up until we're completely outside of any node_modules
while (currentPath && hasNodeModulesSegment(currentPath)) {
  const parentPath = path.dirname(currentPath);
  if (parentPath === currentPath) break; // Reached filesystem root
  currentPath = parentPath;
}

// Step 2: From this point (outside node_modules), search upward for package.json
// Make sure the package.json we find is NOT inside node_modules
while (currentPath) {
  const packageJsonPath = path.join(currentPath, 'package.json');
  
  // Check if this directory has a package.json AND is not inside node_modules
  if (fs.existsSync(packageJsonPath) && !hasNodeModulesSegment(currentPath)) {
    rootPath = currentPath;
    break;
  }
  
  const parentPath = path.dirname(currentPath);
  if (parentPath === currentPath) break; // Reached filesystem root
  currentPath = parentPath;
}

// Step 3: Fallback to INIT_CWD if available and it's not in node_modules
if (!rootPath && process.env.INIT_CWD && !hasNodeModulesSegment(process.env.INIT_CWD)) {
  rootPath = process.env.INIT_CWD;
}

// Step 4: Final fallback to process.cwd() if it's not in node_modules
if (!rootPath) {
  const cwd = process.cwd();
  if (!hasNodeModulesSegment(cwd)) {
    rootPath = cwd;
  }
}

// Validate that we found a root path that is NOT inside node_modules
if (!rootPath || !fs.existsSync(rootPath)) {
  console.error('[workant] Error: Could not determine repository root path');
  console.error('[workant] Package path was:', packagePath);
  process.exit(1);
}

if (hasNodeModulesSegment(rootPath)) {
  console.error('[workant] Error: Detected root path is still inside node_modules:', rootPath);
  console.error('[workant] This should not happen. Please report this issue.');
  process.exit(1);
}

console.log('[workant] Repository root determined:', rootPath);

// Copy scripts folder
const scriptsSource = path.join(packagePath, 'scripts');
const scriptsDest = path.join(rootPath, 'scripts');
console.log('[workant] Scripts source:', scriptsSource);
console.log('[workant] Scripts destination:', scriptsDest);

if (fs.existsSync(scriptsSource)) {
  if (fs.existsSync(scriptsDest)) {
    console.log('[workant] Scripts folder already exists at destination, merging...');
  } else {
    console.log('[workant] Copying scripts folder to root...');
  }
  copyRecursiveSync(scriptsSource, scriptsDest);
  console.log('[workant] Scripts folder copied successfully');
} else {
  console.warn('[workant] Scripts folder not found in package at:', scriptsSource);
}

// Copy prompts folder
const promptsSource = path.join(packagePath, 'prompts');
const promptsDest = path.join(rootPath, 'prompts');
console.log('[workant] Prompts source:', promptsSource);
console.log('[workant] Prompts destination:', promptsDest);

if (fs.existsSync(promptsSource)) {
  if (fs.existsSync(promptsDest)) {
    console.log('[workant] Prompts folder already exists at destination, merging...');
  } else {
    console.log('[workant] Copying prompts folder to root...');
  }
  copyRecursiveSync(promptsSource, promptsDest);
  console.log('[workant] Prompts folder copied successfully');
} else {
  console.warn('[workant] Prompts folder not found in package at:', promptsSource);
}

console.log('[workant] Workant scripts and prompts installed successfully!');

// Helper function to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

