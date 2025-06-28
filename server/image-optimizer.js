import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const QUALITY = 75;

export function optimizeImage(inputPath, outputPath = null) {
  if (!outputPath) {
    outputPath = inputPath;
  }

  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    // Skip optimization if file is already small enough
    if (originalSize < 100 * 1024) { // Less than 100KB
      return inputPath;
    }

    const tempPath = inputPath + '.tmp.jpg';
    
    // Use ffmpeg to resize and compress
    const cmd = `ffmpeg -i "${inputPath}" -vf "scale='min(${MAX_WIDTH},iw)':'min(${MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease" -q:v ${QUALITY} "${tempPath}" -y`;
    
    execSync(cmd, { stdio: 'pipe' });

    // Check if optimization was successful
    if (fs.existsSync(tempPath)) {
      const optimizedSize = fs.statSync(tempPath).size;
      
      if (optimizedSize < originalSize && optimizedSize > 0) {
        // Replace original with optimized version
        fs.renameSync(tempPath, outputPath);
        console.log(`Image optimized: ${path.basename(inputPath)} (${Math.round((originalSize - optimizedSize) / 1024)}KB saved)`);
        return outputPath;
      } else {
        // Remove temp file if optimization didn't help
        fs.unlinkSync(tempPath);
      }
    }

    return inputPath;
  } catch (error) {
    console.error(`Failed to optimize image ${inputPath}:`, error.message);
    
    // Clean up temp file if it exists
    const tempPath = inputPath + '.tmp.jpg';
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {}
    }
    
    return inputPath;
  }
}

export function cleanupOldImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
  let cleaned = 0;

  try {
    const files = fs.readdirSync(uploadsDir);
    
    for (const file of files) {
      // Only clean menu images, not essential files
      if (file.startsWith('menu-')) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} old menu images`);
    }
  } catch (error) {
    console.error('Failed to clean up old images:', error.message);
  }
}

// Run cleanup on startup
cleanupOldImages();