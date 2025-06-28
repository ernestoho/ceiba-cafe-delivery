
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function optimizeImage(inputPath: string, outputPath: string): Promise<void> {
  try {
    await sharp(inputPath)
      .resize(800, 600, { 
        fit: 'cover',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 75,
        progressive: true 
      })
      .toFile(outputPath);
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}

export async function optimizeExistingImages(): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const files = await fs.readdir(uploadsDir);
  
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png|webp)$/i) && !file.includes('optimized')) {
      const inputPath = path.join(uploadsDir, file);
      const outputPath = path.join(uploadsDir, `optimized-${file.replace(/\.[^.]+$/, '.jpg')}`);
      
      try {
        await optimizeImage(inputPath, outputPath);
        console.log(`Optimized: ${file}`);
      } catch (error) {
        console.error(`Failed to optimize ${file}:`, error);
      }
    }
  }
}
