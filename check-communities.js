// Simple script to check existing communities
import { client } from './sanity/lib/client.js';

async function checkCommunities() {
  try {
    console.log('🔍 Checking existing communities...');
    
    const communities = await client.fetch(`
      *[_type == "startupCommunity"] {
        _id,
        name,
        "startupId": startup._ref,
        "startupTitle": startup->title,
        isActive,
        createdAt
      }
    `);
    
    console.log('📊 Found communities:', communities.length);
    
    if (communities.length > 0) {
      console.log('\n📋 Existing communities:');
      communities.forEach((community, index) => {
        console.log(`${index + 1}. ${community.name}`);
        console.log(`   - ID: ${community._id}`);
        console.log(`   - Startup: ${community.startupTitle} (${community.startupId})`);
        console.log(`   - Active: ${community.isActive}`);
        console.log(`   - Created: ${community.createdAt}`);
        console.log('');
      });
    } else {
      console.log('✅ No existing communities found');
    }
    
  } catch (error) {
    console.error('❌ Error checking communities:', error);
  }
}

checkCommunities();
