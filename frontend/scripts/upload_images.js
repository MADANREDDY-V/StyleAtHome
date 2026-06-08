import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadImages() {
  const BUCKET_NAME = 'products';
  
  // Ensure bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }
  
  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`Creating bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    if (createError) {
      console.error("Error creating bucket:", createError);
      return;
    }
  }

  const assetsDir = path.resolve(__dirname, '../../frontend-js/src/assets');
  
  async function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await walkDir(fullPath);
      } else {
        // Only process images
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;
        
        const relativePath = path.relative(assetsDir, fullPath).replace(/\\/g, '/');
        const fileData = fs.readFileSync(fullPath);
        
        console.log(`Uploading ${relativePath}...`);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(relativePath, fileData, {
          upsert: true,
          contentType: 'image/' + path.extname(file).slice(1).replace('jpg', 'jpeg')
        });
        
        if (error) {
          console.error(`Failed to upload ${relativePath}:`, error);
        }
      }
    }
  }
  
  console.log("Starting image upload...");
  await walkDir(assetsDir);
  console.log("Image upload complete!");
}

uploadImages();
