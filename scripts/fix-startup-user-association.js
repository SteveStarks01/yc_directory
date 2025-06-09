#!/usr/bin/env node

/**
 * Script to fix the user association for the existing startup
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
  requestTagPrefix: 'yc-directory-fix-user-association',
  perspective: 'published',
});

async function fixUserAssociation() {
  try {
    console.log('🔧 Fixing Startup User Association');
    console.log('===================================');
    console.log('');
    
    const targetUserId = 'user_2yFAKXfg7ZC1FYtU6Bps612vETQ';
    console.log('Target User ID:', targetUserId);
    console.log('');
    
    // Step 1: Create user profile if it doesn't exist
    console.log('📊 Checking if user profile exists...');
    let userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId: targetUserId }
    );
    
    if (!userProfile) {
      console.log('❌ User profile not found. Creating new user profile...');
      userProfile = await client.create({
        _type: "userProfile",
        userId: targetUserId,
        name: "User", // Default name
        username: `user_${targetUserId.slice(-8)}`, // Generate username from user ID
        email: "", // Will be updated when user provides it
        bio: "",
        image: "", // Default avatar
        socialLinks: {},
        skills: [],
        interests: [],
        location: {},
        company: "",
        position: "",
        website: "",
        verified: false,
        role: "user",
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });
      console.log('✅ Created user profile:', userProfile._id);
    } else {
      console.log('✅ User profile already exists:', userProfile._id);
    }
    
    console.log('');
    
    // Step 2: Find startups that need to be associated with this user
    console.log('📊 Finding startups that need user association...');
    const startupsToFix = await client.fetch(`
      *[_type == "startup" && author->userId == null] {
        _id,
        title,
        name,
        author->{
          _id,
          name,
          userId
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
      console.log(`      Current Author: ${startup.author?.name || 'No author'} (${startup.author?.userId || 'No userId'})`);
      console.log('');
    });
    
    // Step 3: Update startups to reference the correct user profile
    console.log('🔄 Updating startups to reference correct user profile...');
    
    const updatePromises = startupsToFix.map(async (startup) => {
      try {
        const result = await client
          .patch(startup._id)
          .set({ 
            author: {
              _type: "reference",
              _ref: userProfile._id,
            }
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
      console.log('🎉 Startups should now appear in the user dashboard!');
      console.log(`   User Profile ID: ${userProfile._id}`);
      console.log(`   User ID: ${targetUserId}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing user association:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
console.log('🚀 Starting User Association Fix');
console.log('');

fixUserAssociation()
  .then(() => {
    console.log('');
    console.log('✅ Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
