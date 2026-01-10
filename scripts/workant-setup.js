#!/usr/bin/env node
// Setup script to add postinstall hook to consuming repository's package.json
const fs = require('fs');
const path = require('path');

// Find the repository root
let rootPath = process.cwd();
let currentPath = __dirname;

// Method 1: Look for node_modules and go up one level
while (currentPath) {
  const parentPath = path.dirname(currentPath);
  if (parentPath === currentPath) break;
  
  const nodeModulesPath = path.join(parentPath, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    rootPath = parentPath;
    break;
  }
  
  currentPath = parentPath;
}

// Method 2: Use INIT_CWD if available
if (!rootPath || rootPath === __dirname) {
  rootPath = process.env.INIT_CWD || process.cwd();
}

const packageJsonPath = path.join(rootPath, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in repository root');
  process.exit(1);
}

console.log('Reading package.json...');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Ensure scripts object exists
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

// The postinstall command to add
const postinstallCommand = 'node node_modules/@intraweb-technology/workant/postinstall.js';

// Check if postinstall already exists
if (packageJson.scripts.postinstall) {
  const existingPostinstall = packageJson.scripts.postinstall;
  
  // Check if our command is already in the postinstall script
  if (existingPostinstall.includes('@intraweb-technology/workant/postinstall.js')) {
    console.log('Postinstall script already includes workant setup');
    process.exit(0);
  }
  
  // Append our command to existing postinstall
  console.log('Adding workant to existing postinstall script...');
  packageJson.scripts.postinstall = `${postinstallCommand} && ${existingPostinstall}`;
} else {
  // Create new postinstall script
  console.log('Creating new postinstall script...');
  packageJson.scripts.postinstall = postinstallCommand;
}

// Write the updated package.json
console.log('Writing updated package.json...');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Successfully added postinstall script to package.json');
console.log('The postinstall script will now copy scripts and prompts folders to the root on every install');

