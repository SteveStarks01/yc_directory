#!/usr/bin/env node

/**
 * Script to check the current state of the Sanity database
 * This will help us verify if the deletion script actually worked
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
  requestTagPrefix: 'yc-directory-check',
  perspective: 'published',
});

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking Sanity Database State');
    console.log('=====================================');
    console.log('');
    
    console.log('🔧 Configuration:');
    console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log(`   API Version: ${process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-14'}`);
    console.log(`   Has Token: ${!!process.env.SANITY_WRITE_TOKEN}`);
    console.log('');
    
    // Check startup count
    console.log('📊 Checking startup documents...');
    const startupCount = await client.fetch(`count(*[_type == "startup"])`);
    console.log(`   Total startups: ${startupCount}`);
    
    if (startupCount > 0) {
      console.log('');
      console.log('📋 Existing startups:');
      const startups = await client.fetch(`
        *[_type == "startup"] | order(_createdAt desc) {
          _id,
          name,
          title,
          _createdAt,
          _updatedAt,
          "authorId": author._ref,
          "foundersCount": count(founders)
        }
      `);
      
      startups.forEach((startup, index) => {
        console.log(`   ${index + 1}. ${startup._id}`);
        console.log(`      Name: ${startup.name || startup.title || 'Unnamed'}`);
        console.log(`      Created: ${startup._createdAt}`);
        console.log(`      Updated: ${startup._updatedAt}`);
        console.log(`      Author ID: ${startup.authorId || 'None'}`);
        console.log(`      Founders: ${startup.foundersCount || 0}`);
        console.log('');
      });
    }
    
    // Check community count
    console.log('📊 Checking community documents...');
    const communityCount = await client.fetch(`count(*[_type == "startupCommunity"])`);
    console.log(`   Total communities: ${communityCount}`);
    
    if (communityCount > 0) {
      console.log('');
      console.log('📋 Existing communities:');
      const communities = await client.fetch(`
        *[_type == "startupCommunity"] | order(_createdAt desc) {
          _id,
          name,
          "startupId": startup._ref,
          _createdAt
        }
      `);
      
      communities.forEach((community, index) => {
        console.log(`   ${index + 1}. ${community._id}`);
        console.log(`      Name: ${community.name}`);
        console.log(`      Startup ID: ${community.startupId}`);
        console.log(`      Created: ${community._createdAt}`);
        console.log('');
      });
    }
    
    // Check other related documents
    console.log('📊 Checking related documents...');
    const followCount = await client.fetch(`count(*[_type == "startupFollow"])`);
    const loveCount = await client.fetch(`count(*[_type == "startupLove"])`);
    const reviewCount = await client.fetch(`count(*[_type == "startupReview"])`);
    
    console.log(`   Startup Follows: ${followCount}`);
    console.log(`   Startup Loves: ${loveCount}`);
    console.log(`   Startup Reviews: ${reviewCount}`);
    console.log('');
    
    // Summary
    console.log('📝 Summary:');
    if (startupCount === 0) {
      console.log('   ✅ Database is clean - no startups found');
    } else {
      console.log(`   ⚠️  Database still contains ${startupCount} startup(s)`);
      console.log('   🔄 Deletion script may not have worked properly');
    }
    
    if (communityCount > 0) {
      console.log(`   ⚠️  Found ${communityCount} orphaned communities`);
    }
    
    const totalRelated = followCount + loveCount + reviewCount;
    if (totalRelated > 0) {
      console.log(`   ⚠️  Found ${totalRelated} related documents that may need cleanup`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database state:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
console.log('🚀 Starting Database State Check');
console.log('');

checkDatabaseState()
  .then(() => {
    console.log('');
    console.log('✅ Database check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  });
