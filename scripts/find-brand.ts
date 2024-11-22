import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEARCH_TERMS = [
  'pera-pera',
  'perapera',
  'PeraPera'
];

const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  '.git',
  'scripts'
];

const FOCUS_PATHS = [
  'src/components/Layout',
  'src/constants',
  'README.md',
  'index.html',
  'package.json',
  'tsconfig.json'
];

async function searchFiles(dir: string) {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const path = join(dir, file.name);
    const relativePath = relative(process.cwd(), path);
    
    // 检查是否是我们关注的路径
    const isFocusPath = FOCUS_PATHS.some(focusPath => 
      relativePath.startsWith(focusPath)
    );
    
    if (file.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file.name) && isFocusPath) {
        await searchFiles(path);
      }
      continue;
    }
    
    if (!isFocusPath) continue;
    
    try {
      const content = await readFile(path, 'utf-8');
      for (const term of SEARCH_TERMS) {
        if (content.includes(term)) {
          console.log(`Found "${term}" in ${relativePath}`);
        }
      }
    } catch (error) {
      console.error(`Error reading ${relativePath}:`, error);
    }
  }
}

console.log('Starting focused search in modified/new files...');
searchFiles(process.cwd())
  .then(() => console.log('Search completed'))
  .catch(console.error); 