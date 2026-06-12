import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.json');

// Simple promise chain to serialize write operations
let writeQueue = Promise.resolve();

export async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, returning default schema:', error);
    return { users: [], inquiries: [] };
  }
}

export async function writeDb(data) {
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue.then(async () => {
      try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
        resolve();
      } catch (error) {
        console.error('Error writing database file:', error);
        reject(error);
      }
    });
  });
}
