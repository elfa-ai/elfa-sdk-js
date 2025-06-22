import { V1CompatibilityLayer } from '../compatibility/v1.js';
import { ElfaSDK } from '../client/ElfaSDK.js';

export async function v1MigrationExample(): Promise<void> {
  console.log('=== V1 to SDK Migration Example ===\n');

  const v1Client = new V1CompatibilityLayer({
    elfaApiKey: 'your-elfa-api-key',
    twitterApiKey: 'your-twitter-bearer-token',
    enableV1Behavior: true
  });

  try {
    console.log('1. Using V1-compatible methods with enhanced data...');

    const topMentions = await v1Client.getTopMentions({
      ticker: 'bitcoin',
      timeWindow: '24h',
      fetchRawTweets: true
    });
    console.log(`Found ${topMentions.data.data.length} top mentions`);

    const searchResults = await v1Client.getMentionsByKeywords({
      keywords: 'ethereum',
      from: Math.floor(Date.now() / 1000) - 3600,
      to: Math.floor(Date.now() / 1000),
      fetchRawTweets: true
    });
    console.log(`Found ${searchResults.data.length} keyword mentions`);

    const trending = await v1Client.getTrendingTokens({
      timeWindow: '24h',
      pageSize: 5
    });
    console.log(`Found ${trending.data.data.length} trending tokens`);

  } catch (error) {
    console.error('Error in V1 compatibility example:', error);
  }
}

export async function newSDKExample(): Promise<void> {
  console.log('\n=== New SDK Usage ===\n');

  const sdk = new ElfaSDK({
    elfaApiKey: 'your-elfa-api-key',
    twitterApiKey: 'your-twitter-bearer-token',
    fetchRawTweets: false
  });

  try {
    console.log('1. Modern SDK with explicit raw tweet control...');

    const mentions = await sdk.getKeywordMentions({
      keywords: 'bitcoin',
      period: '1h',
      fetchRawTweets: true
    });
    console.log(`SDK mentions: ${mentions.data.length}`);

    const tokenNews = await sdk.getTokenNews({
      coinIds: 'bitcoin,ethereum',
      pageSize: 5,
      fetchRawTweets: true
    });
    console.log(`Token news: ${tokenNews.data.length}`);

    const trendingCAs = await sdk.getTrendingCAsTwitter({
      timeWindow: '24h',
      minMentions: 10
    });
    console.log(`Trending contract addresses: ${trendingCAs.data.data.length}`);

  } catch (error) {
    console.error('Error in new SDK example:', error);
  }
}

// For detailed migration steps, see docs/MIGRATION.md

if (require.main === module) {
  v1MigrationExample()
    .then(() => newSDKExample())
    .catch(console.error);
}