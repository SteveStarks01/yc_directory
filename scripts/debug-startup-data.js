#!/usr/bin/env node

/**
 * Debug script to check what startup data actually exists in the database
 * This will help us understand why the frontend is showing startups
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
  requestTagPrefix: 'yc-directory-debug',
  perspective: 'published',
});

async function debugStartupData() {
  try {
    console.log('🔍 Debugging Startup Data');
    console.log('==========================');
    console.log('');
    
    // Check all startup documents (no filters)
    console.log('📊 Checking ALL startup documents (no filters)...');
    const allStartups = await client.fetch(`
      *[_type == "startup"] {
        _id,
        title,
        name,
        slug,
        status,
        visibility,
        _createdAt,
        _updatedAt
      }
    `);
    
    console.log(`   Total startups (no filters): ${allStartups.length}`);
    
    if (allStartups.length > 0) {
      console.log('');
      console.log('📋 All startup documents:');
      allStartups.forEach((startup, index) => {
        console.log(`   ${index + 1}. ${startup._id}`);
        console.log(`      Title: ${startup.title || startup.name || 'Unnamed'}`);
        console.log(`      Slug: ${startup.slug?.current || 'No slug'}`);
        console.log(`      Status: ${startup.status || 'No status field'}`);
        console.log(`      Visibility: ${startup.visibility || 'No visibility field'}`);
        console.log(`      Created: ${startup._createdAt}`);
        console.log(`      Updated: ${startup._updatedAt}`);
        console.log('');
      });
    }
    
    // Check startups with slug defined (home page filter)
    console.log('📊 Checking startups with defined slug (home page filter)...');
    const startupsWithSlug = await client.fetch(`
      *[_type == "startup" && defined(slug.current)] {
        _id,
        title,
        name,
        slug,
        status,
        visibility
      }
    `);
    
    console.log(`   Startups with slug: ${startupsWithSlug.length}`);
    
    // Check startups with status == "active" (API filter)
    console.log('📊 Checking startups with status == "active" (API filter)...');
    const activeStartups = await client.fetch(`
      *[_type == "startup" && status == "active"] {
        _id,
        title,
        name,
        slug,
        status,
        visibility
      }
    `);
    
    console.log(`   Active startups: ${activeStartups.length}`);
    
    // Check what the home page query actually returns
    console.log('📊 Testing home page query...');
    const homePageQuery = `*[_type == "startup" && defined(slug.current)] | order(_createdAt desc) [0...20] {
      _id,
      title,
      slug,
      _createdAt,
      author -> {
        _id, name, image
      },
      views,
      description,
      category,
      image,
    }`;
    
    const homePageResults = await client.fetch(homePageQuery);
    console.log(`   Home page query results: ${homePageResults.length}`);
    
    if (homePageResults.length > 0) {
      console.log('');
      console.log('📋 Home page query results:');
      homePageResults.forEach((startup, index) => {
        console.log(`   ${index + 1}. ${startup._id} - ${startup.title}`);
      });
    }
    
    // Check what the API query returns
    console.log('');
    console.log('📊 Testing API query...');
    const apiQuery = `*[_type == "startup" && status == "active" && visibility in ["public", "community"]] | order(createdAt desc) {
      _id,
      name,
      slug,
      status,
      visibility
    }`;
    
    const apiResults = await client.fetch(apiQuery);
    console.log(`   API query results: ${apiResults.length}`);
    
    // Summary
    console.log('');
    console.log('📝 Summary:');
    console.log(`   Total startups in DB: ${allStartups.length}`);
    console.log(`   Startups with slug: ${startupsWithSlug.length}`);
    console.log(`   Active startups: ${activeStartups.length}`);
    console.log(`   Home page results: ${homePageResults.length}`);
    console.log(`   API results: ${apiResults.length}`);
    
    if (homePageResults.length > 0 && apiResults.length === 0) {
      console.log('');
      console.log('🎯 ISSUE IDENTIFIED:');
      console.log('   - Home page query returns startups');
      console.log('   - API query returns no startups');
      console.log('   - This suggests inconsistent filtering between queries');
      console.log('   - The startups likely don\'t have status="active" or proper visibility');
    }
    
  } catch (error) {
    console.error('❌ Error debugging startup data:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug
console.log('🚀 Starting Startup Data Debug');
console.log('');

debugStartupData()
  .then(() => {
    console.log('');
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
