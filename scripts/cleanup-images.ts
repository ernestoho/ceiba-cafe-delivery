
import fs from 'fs/promises';
import path from 'path';

async function cleanupImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    const files = await fs.readdir(uploadsDir);
    let deletedCount = 0;
    let savedSpace = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files larger than 500KB that aren't optimized
      if (stats.size > 500 * 1024 && !file.includes('optimized') && !file.includes('.gitkeep')) {
        console.log(`Deleting large file: ${file} (${Math.round(stats.size / 1024)}KB)`);
        await fs.unlink(filePath);
        deletedCount++;
        savedSpace += stats.size;
      }
    }
    
    console.log(`Cleanup complete: Deleted ${deletedCount} files, saved ${Math.round(savedSpace / (1024 * 1024))}MB`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupImages();
