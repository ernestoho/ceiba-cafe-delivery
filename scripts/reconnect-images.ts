import { db } from "../server/db";
import { menuItems } from "../shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface ImageFile {
  filename: string;
  timestamp: number;
  isOptimized: boolean;
}

async function reconnectImages() {
  console.log("Starting image reconnection process...");
  
  // Get all optimized images from uploads folder
  const uploadsDir = path.join(process.cwd(), "uploads");
  const files = fs.readdirSync(uploadsDir);
  
  // Filter for optimized menu images
  const optimizedImages: ImageFile[] = files
    .filter(file => file.startsWith("optimized-menu-") || file.endsWith("_optimized.jpg") || file.endsWith("_optimized.jpeg"))
    .map(filename => {
      // Extract timestamp from filename
      const timestampMatch = filename.match(/(\d{13})/);
      const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : 0;
      
      return {
        filename,
        timestamp,
        isOptimized: true
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
  
  console.log(`Found ${optimizedImages.length} optimized images`);
  
  // Get all menu items from database
  const allMenuItems = await db.select().from(menuItems);
  console.log(`Found ${allMenuItems.length} menu items in database`);
  
  // Group menu items by category for systematic assignment
  const itemsByCategory = allMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof allMenuItems>);
  
  let imageIndex = 0;
  let updatedCount = 0;
  
  // Process each category
  for (const [category, items] of Object.entries(itemsByCategory)) {
    console.log(`\nProcessing ${category} category (${items.length} items)...`);
    
    for (const item of items) {
      if (imageIndex < optimizedImages.length) {
        const imageFile = optimizedImages[imageIndex];
        const newImagePath = `/uploads/${imageFile.filename}`;
        
        // Update the menu item with the new image path
        await db
          .update(menuItems)
          .set({ image: newImagePath })
          .where(eq(menuItems.id, item.id));
        
        console.log(`✓ Updated "${item.name}" with image: ${imageFile.filename}`);
        updatedCount++;
        imageIndex++;
      } else {
        console.log(`⚠ No more images available for "${item.name}"`);
        break;
      }
    }
    
    if (imageIndex >= optimizedImages.length) {
      console.log("All available images have been assigned");
      break;
    }
  }
  
  console.log(`\n✅ Process completed!`);
  console.log(`📊 Updated ${updatedCount} menu items with custom images`);
  console.log(`📸 Used ${imageIndex} out of ${optimizedImages.length} available images`);
  
  // Show some statistics
  const remainingItems = allMenuItems.length - updatedCount;
  if (remainingItems > 0) {
    console.log(`📝 ${remainingItems} items still using placeholder images`);
  }
}

// Run the script
reconnectImages()
  .then(() => {
    console.log("Image reconnection completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during image reconnection:", error);
    process.exit(1);
  });