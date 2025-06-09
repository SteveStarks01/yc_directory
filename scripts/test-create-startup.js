#!/usr/bin/env node

/**
 * Script to test the updated createPitch action
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
  requestTagPrefix: 'yc-directory-test-create',
  perspective: 'published',
});

async function testCreateStartup() {
  try {
    console.log('🧪 Testing Startup Creation');
    console.log('============================');
    console.log('');
    
    // Get the user profile first
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && userId == $userId][0] {
        _id,
        userId,
        name
      }
    `, { userId: 'user_2yFAKXfg7ZC1FYtU6Bps612vETQ' });
    
    if (!userProfile) {
      console.log('❌ User profile not found!');
      return;
    }
    
    console.log('✅ User profile found:', userProfile._id);
    console.log('');
    
    // Create a test startup with the new field structure
    const testStartup = {
      _type: 'startup',
      
      // New field names (primary)
      name: 'GreenEnergy - Solar Panel Optimizer',
      description: 'AI-powered software that optimizes solar panel placement and energy output for residential and commercial buildings, reducing installation costs by 30%',
      industry: 'Clean Tech',
      logo: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      slug: {
        _type: 'slug',
        current: 'greenenergy-solar-panel-optimizer',
      },
      author: {
        _type: 'reference',
        _ref: userProfile._id,
      },
      founders: [
        {
          _type: 'reference',
          _ref: userProfile._id,
        },
      ],
      pitch: 'Our proprietary AI algorithm analyzes building structures, local weather patterns, and energy consumption data to provide optimal solar panel configurations. We\'ve already helped 50+ installations achieve 30% better efficiency than traditional methods.',
      status: 'active',
      visibility: 'public',
      views: 0,
      stage: 'idea',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Legacy field names for backward compatibility
      title: 'GreenEnergy - Solar Panel Optimizer',
      category: 'Clean Tech',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    };
    
    console.log('📝 Creating test startup...');
    console.log('   Name:', testStartup.name);
    console.log('   Industry:', testStartup.industry);
    console.log('   Stage:', testStartup.stage);
    console.log('   Status:', testStartup.status);
    console.log('');
    
    const result = await client.create(testStartup);
    
    console.log('✅ Startup created successfully!');
    console.log('   ID:', result._id);
    console.log('   Rev:', result._rev);
    console.log('');
    
    // Verify the startup was created with correct fields
    console.log('🔍 Verifying startup data...');
    const createdStartup = await client.fetch(`
      *[_type == "startup" && _id == $startupId][0] {
        _id,
        name,
        title,
        industry,
        category,
        logo,
        image,
        description,
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
    `, { startupId: result._id });
    
    if (createdStartup) {
      console.log('✅ Startup verification successful!');
      console.log('');
      console.log('📋 Field verification:');
      console.log('   NEW FIELDS:');
      console.log('   - name:', createdStartup.name || 'null');
      console.log('   - industry:', createdStartup.industry || 'null');
      console.log('   - logo:', createdStartup.logo ? 'Present' : 'null');
      console.log('');
      console.log('   LEGACY FIELDS:');
      console.log('   - title:', createdStartup.title || 'null');
      console.log('   - category:', createdStartup.category || 'null');
      console.log('   - image:', createdStartup.image ? 'Present' : 'null');
      console.log('');
      console.log('   OTHER FIELDS:');
      console.log('   - description:', createdStartup.description ? 'Present' : 'null');
      console.log('   - stage:', createdStartup.stage || 'null');
      console.log('   - status:', createdStartup.status || 'null');
      console.log('   - visibility:', createdStartup.visibility || 'null');
      console.log('   - views:', createdStartup.views);
      console.log('   - createdAt:', createdStartup.createdAt || 'null');
      console.log('   - updatedAt:', createdStartup.updatedAt || 'null');
      console.log('   - slug:', createdStartup.slug?.current || 'null');
      console.log('');
      console.log('   ASSOCIATIONS:');
      console.log('   - author:', createdStartup.author?.userId || 'null');
      console.log('   - founders:', createdStartup.founders?.length || 0, 'founder(s)');
      
      // Test API query compatibility
      console.log('');
      console.log('🔍 Testing API query compatibility...');
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
      
      const apiResult = await client.fetch(apiQuery, { userProfileId: userProfile._id });
      
      if (apiResult && apiResult.length > 0) {
        const newStartup = apiResult.find(s => s._id === result._id);
        if (newStartup) {
          console.log('✅ New startup appears in API query!');
          console.log('   - name:', newStartup.name || 'null');
          console.log('   - title (legacy):', newStartup.title || 'null');
          console.log('   - industry:', newStartup.industry || 'null');
          console.log('   - category (legacy):', newStartup.category || 'null');
          console.log('   - logo:', newStartup.logo ? 'Present' : 'null');
          console.log('   - image (legacy):', newStartup.image ? 'Present' : 'null');
        } else {
          console.log('❌ New startup not found in API query');
        }
        
        console.log('');
        console.log(`📊 Total startups for user: ${apiResult.length}`);
      } else {
        console.log('❌ No startups found in API query');
      }
      
    } else {
      console.log('❌ Failed to verify startup data');
    }
    
  } catch (error) {
    console.error('❌ Error testing startup creation:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
console.log('🚀 Starting Startup Creation Test');
console.log('');

testCreateStartup()
  .then(() => {
    console.log('');
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
