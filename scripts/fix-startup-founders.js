#!/usr/bin/env node

/**
 * Script to fix the founders array for existing startups
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
  requestTagPrefix: 'yc-directory-fix-founders',
  perspective: 'published',
});

async function fixStartupFounders() {
  try {
    console.log('🔧 Fixing Startup Founders Array');
    console.log('=================================');
    console.log('');
    
    // Step 1: Find startups that have an author but no founders
    console.log('📊 Finding startups with author but no founders...');
    const startupsToFix = await client.fetch(`
      *[_type == "startup" && defined(author) && (!defined(founders) || length(founders) == 0)] {
        _id,
        title,
        name,
        author->{
          _id,
          userId,
          name
        }
      }
    `);
    
    console.log(`   Found ${startupsToFix.length} startups to fix`);
    
    if (startupsToFix.length === 0) {
      console.log('✅ No startups need fixing!');
      return;
    }
    
    console.log('');
    console.log('📋 Startups to fix:');
    startupsToFix.forEach((startup, index) => {
      console.log(`   ${index + 1}. ${startup._id}`);
      console.log(`      Title: ${startup.title || startup.name || 'Unnamed'}`);
      console.log(`      Author: ${startup.author?.name || 'Unknown'} (${startup.author?._id})`);
      console.log('');
    });
    
    // Step 2: Update startups to add author to founders array
    console.log('🔄 Adding authors to founders array...');
    
    const updatePromises = startupsToFix.map(async (startup) => {
      try {
        if (!startup.author?._id) {
          console.log(`   ⚠️  Skipping ${startup._id} - no author ID`);
          return { success: false, id: startup._id, error: 'No author ID' };
        }
        
        const result = await client
          .patch(startup._id)
          .set({ 
            founders: [
              {
                _type: "reference",
                _ref: startup.author._id,
              },
            ]
          })
          .commit();
        
        console.log(`   ✅ Updated ${startup._id} - ${startup.title || startup.name}`);
        return { success: true, id: startup._id, result };
      } catch (error) {
        console.error(`   ❌ Failed to update ${startup._id}:`, error.message);
        return { success: false, id: startup._id, error: error.message };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    // Summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('');
    console.log('📝 Summary:');
    console.log(`   ✅ Successfully updated: ${successful.length} startups`);
    console.log(`   ❌ Failed to update: ${failed.length} startups`);
    
    if (failed.length > 0) {
      console.log('');
      console.log('❌ Failed updates:');
      failed.forEach(f => {
        console.log(`   - ${f.id}: ${f.error}`);
      });
    }
    
    if (successful.length > 0) {
      console.log('');
      console.log('🎉 Startups should now appear in user queries that use references()!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing startup founders:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
console.log('🚀 Starting Startup Founders Fix');
console.log('');

fixStartupFounders()
  .then(() => {
    console.log('');
    console.log('✅ Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
