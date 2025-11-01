// backend/scripts/fixFilePaths.js
// Run this ONCE to fix all existing file paths in your database

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFilePaths() {
  console.log('🔧 Starting to fix file paths in database...\n');

  try {
    // Get all files from database
    const files = await prisma.file.findMany();

    console.log(`📁 Found ${files.length} files to process\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const originalUrl = file.url;
        
        // Clean the URL
        let cleanedUrl = originalUrl
          // Remove all backslashes and replace with forward slashes
          .replace(/\\/g, '/')
          // Remove any quotes (single or double)
          .replace(/["']/g, '')
          // Remove 'uploads/' prefix if present
          .replace(/^uploads\//, '')
          // Remove leading slashes
          .replace(/^\/+/, '')
          // Remove trailing slashes or quotes
          .replace(/[\/\\"']+$/, '')
          // Replace multiple consecutive slashes with single slash
          .replace(/\/+/g, '/');

        // If the path didn't change, skip it
        if (cleanedUrl === originalUrl) {
          console.log(`⏭️  Skipped file ${file.id} - already correct`);
          skippedCount++;
          continue;
        }

        // Update the file record
        await prisma.file.update({
          where: { id: file.id },
          data: { url: cleanedUrl },
        });

        console.log(`✅ Fixed file ${file.id}:`);
        console.log(`   Before: ${originalUrl}`);
        console.log(`   After:  ${cleanedUrl}`);
        console.log('');

        fixedCount++;
      } catch (err) {
        console.error(`❌ Error fixing file ${file.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total files processed:     ${files.length}`);
    console.log(`✅ Files fixed:            ${fixedCount}`);
    console.log(`⏭️  Files skipped:          ${skippedCount}`);
    console.log(`❌ Errors:                 ${errorCount}`);
    console.log('='.repeat(50));
    console.log('\n✨ Done! Your file paths are now clean.\n');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
console.log('='.repeat(50));
console.log('🚀 DATABASE FILE PATH CLEANUP SCRIPT');
console.log('='.repeat(50));
console.log('');

fixFilePaths()
  .then(() => {
    console.log('🎉 Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });