/**
 * MBA Laundry Express - Remove Technology Signatures
 * Post-build script untuk menghapus signature teknologi
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');

// Patterns to remove
const PATTERNS = [
	// Source maps
	/\/\/# sourceMappingURL=.+\n?/g,
	/\/\*\# sourceMappingURL=.+\*\/\n?/g,
	
	// React signatures
	/__REACT_DEVTOOLS_GLOBAL_HOOK__/g,
	/__REACT__/g,
	
	// Vite signatures
	/__VITE__/g,
	/vite\s*:/gi,
	
	// Framework comments
	/\/\*\s*React\s*\*\//gi,
	/\/\*\s*Vue\s*\*\//gi,
	/\/\*\s*@vitejs\s*\*\//gi,
	
	// Console methods that reveal framework
	/console\.log\s*\(\s*['"`]%c\[\w+\]/gi,
];

function processFile(filePath) {
	let content = fs.readFileSync(filePath, 'utf8');
	let modified = false;
	
	PATTERNS.forEach(pattern => {
		if (pattern.test(content)) {
			content = content.replace(pattern, '');
			modified = true;
		}
	});
	
	if (modified) {
		fs.writeFileSync(filePath, content);
		console.log(`✓ Processed: ${filePath}`);
	}
}

function walkDir(dir) {
	const files = fs.readdirSync(dir);
	
	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			walkDir(filePath);
		} else if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html')) {
			processFile(filePath);
		}
	});
}

console.log('🔒 Removing technology signatures...');
walkDir(DIST_DIR);
console.log('✅ Done!');
