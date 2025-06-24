import { ElfaSDK } from '../client/ElfaSDK.js';

export async function basicUsageExample(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: 'your-elfa-api-key',
    fetchRawTweets: false
  });

  try {
    console.log('Testing connection...');
    const connectionStatus = await elfa.testConnection();
    console.log('Connection status:', connectionStatus);

    console.log('Checking API key status...');
    const keyStatus = await elfa.getApiKeyStatus();
    console.log('API Key Status:', keyStatus.data);

    console.log('Fetching trending tokens...');
    const trending = await elfa.getTrendingTokens({
      timeWindow: '24h',
      pageSize: 10
    });
    console.log('Trending tokens:', trending.data.data.slice(0, 3));

    console.log('Searching keyword mentions...');
    const mentions = await elfa.getKeywordMentions({
      keywords: 'bitcoin,ethereum',
      timeWindow: '1h',
      limit: 5
    });
    console.log('Recent mentions:', mentions.data.length);

    console.log('Getting account smart stats...');
    const accountStats = await elfa.getAccountSmartStats({
      username: 'elonmusk'
    });
    console.log('Account stats:', accountStats.data);

    console.log('Fetching trending contract addresses...');
    const trendingCAs = await elfa.getTrendingCAsTwitter({
      timeWindow: '24h',
      pageSize: 5
    });
    console.log('Trending CAs:', trendingCAs.data.data.slice(0, 3));

  } catch (error) {
    console.error('Error in basic usage example:', error);
  }
}

export async function paginationExample(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: 'your-elfa-api-key'
  });

  try {
    console.log('Fetching multiple pages of trending tokens...');
    
    let page = 1;
    let hasMoreData = true;
    const allTokens = [];

    while (hasMoreData && page <= 3) {
      const response = await elfa.getTrendingTokens({
        timeWindow: '24h',
        page,
        pageSize: 20
      });

      allTokens.push(...response.data.data);
      
      const totalPages = Math.ceil(response.data.total / response.data.pageSize);
      hasMoreData = page < totalPages;
      page++;

      console.log(`Page ${page - 1}: ${response.data.data.length} tokens`);
    }

    console.log(`Total tokens collected: ${allTokens.length}`);

  } catch (error) {
    console.error('Error in pagination example:', error);
  }
}

if (require.main === module) {
  basicUsageExample()
    .then(() => paginationExample())
    .catch(console.error);
}