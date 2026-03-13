import fs from 'fs';
import path from 'path';

function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walk(filePath);
            }
        } else {
            if (file.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
                console.log(filePath);
            }
        }
    }
}

console.log('Searching for images...');
walk('.');
