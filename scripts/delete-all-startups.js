#!/usr/bin/env node

/**
 * Script to delete all startup documents from Sanity CMS
 * 
 * This script will:
 * 1. Connect to the Sanity database using the write client
 * 2. Fetch all startup documents
 * 3. Delete them in batches to avoid API limits
 * 4. Clean up any orphaned references
 * 
 * WARNING: This is a destructive operation that cannot be undone!
 */

const { createClient } = require('next-sanity');
require('dotenv').config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-14',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
  requestTagPrefix: 'yc-directory-cleanup',
  perspective: 'published',
});

// Verify client configuration
if (!client.config().token) {
  console.error('❌ Error: SANITY_WRITE_TOKEN not found in environment variables');
  console.error('Please ensure your .env.local file contains the SANITY_WRITE_TOKEN');
  process.exit(1);
}

if (!client.config().projectId) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID not found in environment variables');
  process.exit(1);
}

if (!client.config().dataset) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_DATASET not found in environment variables');
  process.exit(1);
}

console.log('🔧 Sanity Client Configuration:');
console.log(`   Project ID: ${client.config().projectId}`);
console.log(`   Dataset: ${client.config().dataset}`);
console.log(`   API Version: ${client.config().apiVersion}`);
console.log(`   Has Token: ${!!client.config().token}`);
console.log('');

async function deleteReferencingDocuments() {
  console.log('🧹 Step 1: Deleting documents that reference startups...');

  const referencingTypes = [
    { type: 'startupCommunity', field: 'startup', description: 'Startup Communities' },
    { type: 'startupFollow', field: 'startup', description: 'Startup Follows' },
    { type: 'startupLove', field: 'startup', description: 'Startup Loves' },
    { type: 'startupReview', field: 'startup', description: 'Startup Reviews' },
  ];

  for (const refType of referencingTypes) {
    try {
      console.log(`🔍 Checking for ${refType.description}...`);

      const referencingQuery = `*[_type == "${refType.type}" && defined(${refType.field})]._id`;
      const referencingIds = await client.fetch(referencingQuery);

      if (referencingIds.length > 0) {
        console.log(`📋 Found ${referencingIds.length} ${refType.description} to delete`);

        // Delete in batches
        const batchSize = 10;
        for (let i = 0; i < referencingIds.length; i += batchSize) {
          const batch = referencingIds.slice(i, i + batchSize);

          const transaction = client.transaction();
          batch.forEach(id => transaction.delete(id));

          await transaction.commit();
          console.log(`   ✅ Deleted ${batch.length} ${refType.description}`);

          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        console.log(`✅ No ${refType.description} found`);
      }
    } catch (error) {
      console.error(`❌ Error deleting ${refType.description}: ${error.message}`);
    }
  }
}

async function deleteAllStartups() {
  try {
    console.log('🔍 Fetching all startup documents...');

    // First, get a count of all startups
    const countQuery = `count(*[_type == "startup"])`;
    const totalCount = await client.fetch(countQuery);

    console.log(`📊 Found ${totalCount} startup documents to delete`);

    if (totalCount === 0) {
      console.log('✅ No startup documents found. Database is already clean.');
      return;
    }

    // Confirm deletion
    console.log('');
    console.log('⚠️  WARNING: This will permanently delete ALL startup documents and related data!');
    console.log('   This action cannot be undone.');
    console.log('');

    // Delete referencing documents first
    await deleteReferencingDocuments();

    console.log('');
    console.log('🗑️  Step 2: Starting startup deletion process...');
    
    // Fetch all startup document IDs
    const startupIdsQuery = `*[_type == "startup"]._id`;
    const startupIds = await client.fetch(startupIdsQuery);
    
    console.log(`📋 Retrieved ${startupIds.length} startup IDs`);
    
    // Delete in batches to avoid API limits
    const batchSize = 10;
    let deletedCount = 0;
    
    for (let i = 0; i < startupIds.length; i += batchSize) {
      const batch = startupIds.slice(i, i + batchSize);
      
      console.log(`🔄 Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(startupIds.length / batchSize)} (${batch.length} documents)...`);
      
      // Create a transaction to delete multiple documents
      const transaction = client.transaction();
      
      batch.forEach(id => {
        transaction.delete(id);
      });
      
      try {
        await transaction.commit();
        deletedCount += batch.length;
        console.log(`   ✅ Successfully deleted ${batch.length} documents (Total: ${deletedCount}/${startupIds.length})`);
      } catch (error) {
        console.error(`   ❌ Error deleting batch: ${error.message}`);
        // Continue with next batch
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('');
    console.log('🧹 Checking for any remaining startup documents...');
    
    // Verify deletion
    const remainingCount = await client.fetch(countQuery);
    
    if (remainingCount === 0) {
      console.log('✅ SUCCESS: All startup documents have been deleted!');
      console.log(`📊 Total deleted: ${deletedCount} documents`);
    } else {
      console.log(`⚠️  WARNING: ${remainingCount} startup documents still remain`);
      console.log('You may need to run the script again or check for permission issues');
    }
    
    console.log('');
    console.log('🔍 Checking for related documents that may need cleanup...');
    
    // Check for orphaned references
    const orphanedChecks = [
      { type: 'startupCommunity', field: 'startup', description: 'Startup Communities' },
      { type: 'startupFollow', field: 'startup', description: 'Startup Follows' },
      { type: 'startupLove', field: 'startup', description: 'Startup Loves' },
      { type: 'startupReview', field: 'startup', description: 'Startup Reviews' },
    ];
    
    for (const check of orphanedChecks) {
      try {
        const orphanedQuery = `count(*[_type == "${check.type}" && defined(${check.field})])`;
        const orphanedCount = await client.fetch(orphanedQuery);
        
        if (orphanedCount > 0) {
          console.log(`⚠️  Found ${orphanedCount} ${check.description} that may reference deleted startups`);
          console.log(`   Consider running: *[_type == "${check.type}"] to review and clean up`);
        } else {
          console.log(`✅ No orphaned ${check.description} found`);
        }
      } catch (error) {
        console.log(`❓ Could not check ${check.description}: ${error.message}`);
      }
    }
    
    console.log('');
    console.log('🎉 Startup deletion process completed!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Users can now create new startups with the updated schema');
    console.log('   2. New startups will use the "founders" field for proper user association');
    console.log('   3. Dashboard functionality should work correctly with new startups');
    console.log('   4. Community creation will work with proper ownership verification');
    
  } catch (error) {
    console.error('❌ Error during deletion process:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the deletion
console.log('🚀 Starting Sanity Startup Cleanup Script');
console.log('==========================================');
console.log('');

deleteAllStartups()
  .then(() => {
    console.log('');
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
