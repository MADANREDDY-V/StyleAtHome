import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function migrate() {
  try {
    const schemaPath = path.resolve(__dirname, '../../database/postgres_schema.sql');
    const schemaString = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing schema...");
    await sql.unsafe(schemaString);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

migrate();
