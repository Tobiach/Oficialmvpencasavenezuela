import fs from 'fs';
import path from 'path';

function walk(dir: string, depth: number = 0) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const indent = '  '.repeat(depth);
        if (stats.isDirectory()) {
            console.log(`${indent}📁 ${file}`);
            if (file !== 'node_modules' && file !== '.git') {
                walk(filePath, depth + 1);
            }
        } else {
            console.log(`${indent}📄 ${file}`);
        }
    }
}

console.log('Listing all files...');
walk('.');
