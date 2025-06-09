#!/usr/bin/env node

/**
 * Script to verify startup data after migration
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
  requestTagPrefix: 'yc-directory-verify-data',
  perspective: 'published',
});

async function verifyStartupData() {
  try {
    console.log('🔍 Verifying Startup Data');
    console.log('=========================');
    console.log('');
    
    const startupId = 'fU7x7AlmP02dYDHdn9e2eW';
    console.log('Target Startup ID:', startupId);
    console.log('');
    
    // Get the startup data directly
    console.log('📊 Fetching startup data directly from Sanity...');
    const startup = await client.fetch(`
      *[_type == "startup" && _id == $startupId][0] {
        _id,
        _createdAt,
        _updatedAt,
        title,
        name,
        category,
        industry,
        image,
        logo,
        description,
        pitch,
        stage,
        status,
        visibility,
        views,
        createdAt,
        updatedAt,
        slug,
        author->{
          _id,
          userId,
          name
        },
        founders[]->{
          _id,
          userId,
          name
        }
      }
    `, { startupId });
    
    if (!startup) {
      console.log('❌ Startup not found!');
      return;
    }
    
    console.log('✅ Startup found!');
    console.log('');
    console.log('📋 Current startup data:');
    console.log('   ID:', startup._id);
    console.log('   Sanity Created:', startup._createdAt);
    console.log('   Sanity Updated:', startup._updatedAt);
    console.log('');
    console.log('   OLD FIELDS:');
    console.log('   - title:', startup.title || 'null');
    console.log('   - category:', startup.category || 'null');
    console.log('   - image:', startup.image || 'null');
    console.log('');
    console.log('   NEW FIELDS:');
    console.log('   - name:', startup.name || 'null');
    console.log('   - industry:', startup.industry || 'null');
    console.log('   - logo:', startup.logo || 'null');
    console.log('');
    console.log('   OTHER FIELDS:');
    console.log('   - description:', startup.description ? 'Present' : 'null');
    console.log('   - pitch:', startup.pitch ? 'Present' : 'null');
    console.log('   - stage:', startup.stage || 'null');
    console.log('   - status:', startup.status || 'null');
    console.log('   - visibility:', startup.visibility || 'null');
    console.log('   - views:', startup.views);
    console.log('   - createdAt:', startup.createdAt || 'null');
    console.log('   - updatedAt:', startup.updatedAt || 'null');
    console.log('   - slug:', startup.slug?.current || 'null');
    console.log('');
    console.log('   AUTHOR:');
    console.log('   - ID:', startup.author?._id || 'null');
    console.log('   - userId:', startup.author?.userId || 'null');
    console.log('   - name:', startup.author?.name || 'null');
    console.log('');
    console.log('   FOUNDERS:');
    if (startup.founders && startup.founders.length > 0) {
      startup.founders.forEach((founder, index) => {
        console.log(`   - Founder ${index + 1}:`);
        console.log(`     - ID: ${founder._id}`);
        console.log(`     - userId: ${founder.userId || 'null'}`);
        console.log(`     - name: ${founder.name || 'null'}`);
      });
    } else {
      console.log('   - No founders');
    }
    
    // Test the API query that's used in the dashboard
    console.log('');
    console.log('🔍 Testing API query format...');
    const apiQuery = `
      *[_type == "startup" && references($userProfileId) && status == "active"] | order(createdAt desc) {
        _id,
        name,
        slug,
        tagline,
        description,
        logo,
        industry,
        stage,
        foundedYear,
        teamSize,
        location,
        totalFunding,
        valuation,
        website,
        status,
        visibility,
        featured,
        verified,
        views,
        createdAt,
        updatedAt,
        founders[]->{
          _id,
          userId,
          role,
          company,
          position
        },
        // Legacy fields for compatibility
        "title": name,
        "category": industry,
        "image": logo,
        "author": founders[0]->{
          _id,
          "name": coalesce(company, "Unknown"),
          "image": null
        }
      }
    `;
    
    const userProfileId = '4wHcOqfTHoqlQNzqiP87Lb';
    const apiResult = await client.fetch(apiQuery, { userProfileId });
    
    console.log('API Query Result:');
    if (apiResult && apiResult.length > 0) {
      const startup = apiResult[0];
      console.log('   ✅ Found startup in API query');
      console.log('   - name:', startup.name || 'null');
      console.log('   - industry:', startup.industry || 'null');
      console.log('   - logo:', startup.logo || 'null');
      console.log('   - title (legacy):', startup.title || 'null');
      console.log('   - category (legacy):', startup.category || 'null');
      console.log('   - image (legacy):', startup.image || 'null');
      console.log('   - description:', startup.description ? 'Present' : 'null');
      console.log('   - createdAt:', startup.createdAt || 'null');
    } else {
      console.log('   ❌ No startup found in API query');
    }
    
  } catch (error) {
    console.error('❌ Error verifying startup data:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the verification
console.log('🚀 Starting Startup Data Verification');
console.log('');

verifyStartupData()
  .then(() => {
    console.log('');
    console.log('✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
