#!/usr/bin/env node

/**
 * Utility script to remove or comment out console.log statements
 * Run this before production deployment
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REMOVE_LOGS = false; // Set to true to remove, false to comment out
const EXCLUDE_SERVICE_WORKER = false; // Set to true to keep service worker logs

// Directories to process
const directories = [
    './core',
    './modules/timeline',
    './modules/decision-tool',
    './modules/health-monitor'
];

// Add root level files
const rootFiles = [
    './service-worker.js'
];

// Regex patterns for console statements
const consolePatterns = [
    /console\.(log|debug|info)\([^)]*\);?/g,
    /console\.(warn|error)\([^)]*\);?/g  // Optional: remove these too
];

function processFile(filePath) {
    if (EXCLUDE_SERVICE_WORKER && filePath.includes('service-worker.js')) {
        console.log(`Skipping: ${filePath}`);
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        consolePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (REMOVE_LOGS) {
                        // Remove the console statement
                        content = content.replace(match, '');
                    } else {
                        // Comment out the console statement
                        content = content.replace(match, `// ${match}`);
                    }
                    modified = true;
                });
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Processed: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

function processDirectory(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else if (file.endsWith('.js')) {
                processFile(fullPath);
            }
        });
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
}

// Main execution
console.log('🧹 Cleaning console statements...\n');

// Process directories
directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
});

// Process root files
rootFiles.forEach(file => {
    if (fs.existsSync(file) && !EXCLUDE_SERVICE_WORKER) {
        processFile(file);
    }
});

console.log('\n✨ Cleanup complete!');
console.log(`Mode: ${REMOVE_LOGS ? 'REMOVED' : 'COMMENTED OUT'} console statements`);