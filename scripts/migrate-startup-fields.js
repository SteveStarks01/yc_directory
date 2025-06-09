#!/usr/bin/env node

/**
 * Script to migrate startup data from old format to new format
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
  requestTagPrefix: 'yc-directory-migrate-fields',
  perspective: 'published',
});

async function migrateStartupFields() {
  try {
    console.log('🔧 Migrating Startup Fields');
    console.log('============================');
    console.log('');
    
    // Step 1: Find startups that need migration (have old fields but missing new fields)
    console.log('📊 Finding startups that need field migration...');
    const startupsToMigrate = await client.fetch(`
      *[_type == "startup" && (
        (defined(title) && !defined(name)) ||
        (defined(category) && !defined(industry)) ||
        (defined(image) && !defined(logo))
      )] {
        _id,
        title,
        name,
        category,
        industry,
        image,
        logo,
        description,
        pitch,
        _createdAt
      }
    `);
    
    console.log(`   Found ${startupsToMigrate.length} startups to migrate`);
    
    if (startupsToMigrate.length === 0) {
      console.log('✅ No startups need migration!');
      return;
    }
    
    console.log('');
    console.log('📋 Startups to migrate:');
    startupsToMigrate.forEach((startup, index) => {
      console.log(`   ${index + 1}. ${startup._id}`);
      console.log(`      Old title: ${startup.title || 'None'} -> New name: ${startup.name || 'None'}`);
      console.log(`      Old category: ${startup.category || 'None'} -> New industry: ${startup.industry || 'None'}`);
      console.log(`      Old image: ${startup.image || 'None'} -> New logo: ${startup.logo || 'None'}`);
      console.log(`      Description: ${startup.description ? 'Present' : 'Missing'}`);
      console.log(`      Pitch: ${startup.pitch ? 'Present' : 'Missing'}`);
      console.log('');
    });
    
    // Step 2: Migrate each startup
    console.log('🔄 Migrating startup fields...');
    
    const updatePromises = startupsToMigrate.map(async (startup) => {
      try {
        const updates = {};
        
        // Migrate title -> name
        if (startup.title && !startup.name) {
          updates.name = startup.title;
        }
        
        // Migrate category -> industry (with default if missing)
        if (startup.category && !startup.industry) {
          updates.industry = startup.category;
        } else if (!startup.industry) {
          // Set a default industry if none exists
          updates.industry = 'other';
        }
        
        // Migrate image -> logo
        if (startup.image && !startup.logo) {
          updates.logo = startup.image;
        }
        
        // Set default stage if missing
        if (!startup.stage) {
          updates.stage = 'idea';
        }
        
        // Ensure createdAt is set
        if (!startup.createdAt && startup._createdAt) {
          updates.createdAt = startup._createdAt;
        } else if (!startup.createdAt) {
          updates.createdAt = new Date().toISOString();
        }
        
        // Set updatedAt
        updates.updatedAt = new Date().toISOString();
        
        if (Object.keys(updates).length === 0) {
          console.log(`   ⚠️  Skipping ${startup._id} - no updates needed`);
          return { success: true, id: startup._id, updates: {} };
        }
        
        const result = await client
          .patch(startup._id)
          .set(updates)
          .commit();
        
        console.log(`   ✅ Updated ${startup._id}`);
        console.log(`      Applied updates:`, Object.keys(updates).join(', '));
        return { success: true, id: startup._id, result, updates };
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
    console.log(`   ✅ Successfully migrated: ${successful.length} startups`);
    console.log(`   ❌ Failed to migrate: ${failed.length} startups`);
    
    if (failed.length > 0) {
      console.log('');
      console.log('❌ Failed migrations:');
      failed.forEach(f => {
        console.log(`   - ${f.id}: ${f.error}`);
      });
    }
    
    if (successful.length > 0) {
      console.log('');
      console.log('🎉 Startup fields migrated successfully!');
      console.log('   Startups should now display properly in the dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Error migrating startup fields:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the migration
console.log('🚀 Starting Startup Field Migration');
console.log('');

migrateStartupFields()
  .then(() => {
    console.log('');
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
