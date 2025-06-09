#!/usr/bin/env node

/**
 * Script to fix existing startups that don't have a status field
 * This will set status to "active" for all startups without a status
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
  requestTagPrefix: 'yc-directory-fix-status',
  perspective: 'published',
});

async function fixStartupStatus() {
  try {
    console.log('🔧 Fixing Startup Status Fields');
    console.log('=================================');
    console.log('');
    
    // Find all startups without a status field
    console.log('📊 Finding startups without status field...');
    const startupsWithoutStatus = await client.fetch(`
      *[_type == "startup" && !defined(status)] {
        _id,
        title,
        name,
        slug,
        _createdAt,
        author->{
          _id,
          name,
          userId
        }
      }
    `);
    
    console.log(`   Found ${startupsWithoutStatus.length} startups without status field`);
    
    if (startupsWithoutStatus.length === 0) {
      console.log('✅ All startups already have status field set!');
      return;
    }
    
    console.log('');
    console.log('📋 Startups to fix:');
    startupsWithoutStatus.forEach((startup, index) => {
      console.log(`   ${index + 1}. ${startup._id}`);
      console.log(`      Title: ${startup.title || startup.name || 'Unnamed'}`);
      console.log(`      Author: ${startup.author?.name || 'Unknown'} (${startup.author?.userId || 'No userId'})`);
      console.log(`      Created: ${startup._createdAt}`);
      console.log('');
    });
    
    // Update all startups without status to have status: "active"
    console.log('🔄 Updating startups to set status = "active"...');
    
    const updatePromises = startupsWithoutStatus.map(async (startup) => {
      try {
        const result = await client
          .patch(startup._id)
          .set({ 
            status: 'active',
            visibility: 'public', // Also set default visibility if not set
            views: 0 // Initialize views if not set
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
      console.log('🎉 All startups should now appear in dashboard and API queries!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing startup status:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
console.log('🚀 Starting Startup Status Fix');
console.log('');

fixStartupStatus()
  .then(() => {
    console.log('');
    console.log('✅ Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
