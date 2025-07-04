import { ElfaSDK } from "../client/ElfaSDK.js";

export async function enhancedUsageExample(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: "your-elfa-api-key",
    twitterApiKey: "your-twitter-bearer-token",
    fetchRawTweets: false,
  });

  try {
    console.log("Testing enhanced connection...");
    const connectionStatus = await elfa.testConnection();
    console.log("Connection status:", connectionStatus);

    if (!connectionStatus.twitter) {
      console.log("Twitter API not available, using V2-only mode");
    }

    console.log("Fetching keyword mentions without raw content...");
    const basicMentions = await elfa.getKeywordMentions({
      keywords: "bitcoin",
      timeWindow: "1h",
      limit: 3,
      fetchRawTweets: false,
    });
    console.log("Basic mentions (no content):", basicMentions.data.slice(0, 2));

    if (elfa.isTwitterEnabled()) {
      console.log("Fetching keyword mentions WITH raw content...");
      const enhancedMentions = await elfa.getKeywordMentions({
        keywords: "ethereum",
        timeWindow: "1h",
        limit: 3,
        fetchRawTweets: true,
      });

      console.log("Enhanced mentions:");
      enhancedMentions.data.forEach((mention, index) => {
        console.log(`  ${index + 1}. Tweet ID: ${mention.tweetId}`);
        console.log(`     Content: ${(mention as any).content || "N/A"}`);
        console.log(
          `     Data source: ${(mention as any).data_source || "elfa"}`,
        );
        console.log(`     Likes: ${mention.likeCount}`);
        console.log("");
      });

      if ("enhancement_info" in enhancedMentions) {
        console.log("Enhancement info:", enhancedMentions.enhancement_info);
      }
    }
  } catch (error) {
    console.error("Error in enhanced usage example:", error);
  }
}

export async function globalRawTweetExample(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: "your-elfa-api-key",
    twitterApiKey: "your-twitter-bearer-token",
    fetchRawTweets: true,
  });

  try {
    console.log("Using global raw tweet setting...");

    const mentions = await elfa.getKeywordMentions({
      keywords: "solana",
      timeWindow: "1h",
      limit: 2,
    });

    console.log("All mentions include raw content by default:");
    mentions.data.forEach((mention, index) => {
      console.log(
        `  ${index + 1}. ${(mention as any).content || "No content available"}`,
      );
    });

    console.log("Override global setting for this call...");
    const processedMentions = await elfa.getKeywordMentions({
      keywords: "cardano",
      timeWindow: "1h",
      limit: 2,
      fetchRawTweets: false,
    });

    console.log("These mentions have no raw content:");
    processedMentions.data.forEach((mention, index) => {
      console.log(`  ${index + 1}. Tweet ID: ${mention.tweetId} (no content)`);
    });
  } catch (error) {
    console.error("Error in global raw tweet example:", error);
  }
}

export async function errorHandlingExample(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: "your-elfa-api-key",
    twitterApiKey: "your-twitter-bearer-token",
    strictMode: false,
  });

  try {
    console.log("Testing graceful degradation...");

    const mentions = await elfa.getKeywordMentions({
      keywords: "bitcoin",
      timeWindow: "1h",
      limit: 5,
      fetchRawTweets: true,
      enhancementOptions: {
        fallbackToV2: true,
        timeout: 5000,
      },
    });

    console.log("Received mentions with fallback handling");
    if ("enhancement_info" in mentions) {
      console.log("Enhancement info:", mentions.enhancement_info);
    }
  } catch (error) {
    console.error("Error in error handling example:", error);
  }
}

if (require.main === module) {
  enhancedUsageExample()
    .then(() => globalRawTweetExample())
    .then(() => errorHandlingExample())
    .catch(console.error);
}
