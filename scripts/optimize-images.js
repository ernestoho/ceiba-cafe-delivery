#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const UPLOADS_DIR = 'uploads';
const MAX_IMAGE_SIZE = 800; // max width/height
const QUALITY = 75; // JPEG quality
const MAX_AGE_DAYS = 30; // Keep images for 30 days

function optimizeImage(inputPath, outputPath) {
  try {
    // Use ffmpeg to optimize and resize images
    const cmd = `ffmpeg -i "${inputPath}" -vf "scale='min(${MAX_IMAGE_SIZE},iw)':'min(${MAX_IMAGE_SIZE},ih)':force_original_aspect_ratio=decrease" -q:v ${QUALITY} "${outputPath}" -y`;
    execSync(cmd, { stdio: 'pipe' });
    
    // Check if optimization was successful and file is smaller
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    
    if (optimizedSize < originalSize) {
      // Replace original with optimized version
      fs.renameSync(outputPath, inputPath);
      console.log(`Optimized: ${path.basename(inputPath)} (${Math.round((originalSize - optimizedSize) / 1024)}KB saved)`);
    } else {
      // Remove optimized version if it's not smaller
      fs.unlinkSync(outputPath);
    }
  } catch (error) {
    console.error(`Failed to optimize ${inputPath}:`, error.message);
  }
}

function cleanupOldFiles() {
  const cutoffTime = Date.now() - (MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  let cleaned = 0;
  
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Skip essential files
      if (file === 'hero-video-optimized.mp4' || file === 'restaurant-background.jpeg') {
        continue;
      }
      
      // Clean up old temporary menu images
      if (file.startsWith('menu-') && stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        cleaned++;
        console.log(`Cleaned up old file: ${file}`);
      }
    }
    
    console.log(`Cleaned up ${cleaned} old files`);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
}

function optimizeAllImages() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    let optimized = 0;
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const ext = path.extname(file).toLowerCase();
      
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const stats = fs.statSync(filePath);
        
        // Only optimize large files (>100KB)
        if (stats.size > 100 * 1024) {
          const tempPath = filePath + '.tmp';
          optimizeImage(filePath, tempPath);
          optimized++;
        }
      }
    }
    
    console.log(`Processed ${optimized} images for optimization`);
  } catch (error) {
    console.error('Image optimization failed:', error.message);
  }
}

// Main execution
console.log('Starting image optimization and cleanup...');
cleanupOldFiles();
optimizeAllImages();

// Calculate final directory size
try {
  const size = execSync(`du -sh ${UPLOADS_DIR}`, { encoding: 'utf8' }).split('\t')[0];
  console.log(`Final uploads directory size: ${size}`);
} catch (error) {
  console.log('Could not calculate directory size');
}

console.log('Image optimization complete!');