#!/usr/bin/env node

/**
 * Script to debug user association issues with startups
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
  requestTagPrefix: 'yc-directory-debug-user',
  perspective: 'published',
});

async function debugUserAssociation() {
  try {
    console.log('🔍 Debugging User Association');
    console.log('=============================');
    console.log('');
    
    const targetUserId = 'user_2yFAKXfg7ZC1FYtU6Bps612vETQ';
    console.log('Target User ID:', targetUserId);
    console.log('');
    
    // Check all startups and their author associations
    console.log('📊 Checking all startups and their authors...');
    const allStartups = await client.fetch(`
      *[_type == "startup"] {
        _id,
        title,
        name,
        status,
        author->{
          _id,
          userId,
          name,
          username
        },
        founders[]->{
          _id,
          userId,
          name,
          username
        }
      }
    `);
    
    console.log(`   Found ${allStartups.length} startups total`);
    console.log('');
    
    allStartups.forEach((startup, index) => {
      console.log(`   ${index + 1}. ${startup._id}`);
      console.log(`      Title: ${startup.title || startup.name || 'Unnamed'}`);
      console.log(`      Status: ${startup.status || 'No status'}`);
      console.log(`      Author: ${startup.author ? `${startup.author.name} (${startup.author.userId})` : 'No author'}`);
      console.log(`      Founders: ${startup.founders ? startup.founders.map(f => `${f.name} (${f.userId})`).join(', ') : 'No founders'}`);
      console.log('');
    });
    
    // Check user profiles
    console.log('📊 Checking user profiles...');
    const userProfiles = await client.fetch(`
      *[_type == "userProfile"] {
        _id,
        userId,
        name,
        username,
        email
      }
    `);
    
    console.log(`   Found ${userProfiles.length} user profiles`);
    console.log('');
    
    userProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile._id}`);
      console.log(`      User ID: ${profile.userId}`);
      console.log(`      Name: ${profile.name || 'No name'}`);
      console.log(`      Username: ${profile.username || 'No username'}`);
      console.log(`      Email: ${profile.email || 'No email'}`);
      console.log('');
    });
    
    // Check if target user has a profile
    const targetUserProfile = userProfiles.find(p => p.userId === targetUserId);
    if (targetUserProfile) {
      console.log('✅ Target user profile found:', targetUserProfile._id);
      
      // Check startups associated with this user profile
      const userStartups = await client.fetch(`
        *[_type == "startup" && (references($userProfileId) || author._ref == $userProfileId)] {
          _id,
          title,
          name,
          status,
          author->{
            _id,
            userId,
            name
          }
        }
      `, { userProfileId: targetUserProfile._id });
      
      console.log(`   Startups associated with this user: ${userStartups.length}`);
      userStartups.forEach(startup => {
        console.log(`   - ${startup._id}: ${startup.title || startup.name}`);
      });
    } else {
      console.log('❌ Target user profile NOT found');
      console.log('   This means the user needs to be created in the database');
    }
    
  } catch (error) {
    console.error('❌ Error debugging user association:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug
console.log('🚀 Starting User Association Debug');
console.log('');

debugUserAssociation()
  .then(() => {
    console.log('');
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
