import { ElfaSDK } from "../../index";

const apiKey = process.env.ELFA_API_KEY;
const baseUrl = process.env.ELFA_BASE_URL;
const hmacSecret = process.env.ELFA_HMAC_SECRET;

const describeLive = apiKey ? describe : describe.skip;

function makeSdk(): ElfaSDK {
  return new ElfaSDK({
    elfaApiKey: apiKey as string,
    ...(baseUrl ? { baseUrl } : {}),
    ...(hmacSecret ? { hmacSecret } : {}),
  });
}

describeLive("live: data endpoints", () => {
  const elfa = apiKey ? makeSdk() : (undefined as unknown as ElfaSDK);

  it("ping", async () => {
    const res = await elfa.ping();
    expect(res.success).toBe(true);
  });

  it("getApiKeyStatus", async () => {
    const res = await elfa.getApiKeyStatus();
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });

  it("getTrendingTokens", async () => {
    const res = await elfa.getTrendingTokens({ timeWindow: "24h" });
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it("getTopMentions", async () => {
    const res = await elfa.getTopMentions({ ticker: "BTC", timeWindow: "24h" });
    expect(res.success).toBe(true);
  });

  it("getKeywordMentions", async () => {
    const res = await elfa.getKeywordMentions({
      keywords: "bitcoin",
      timeWindow: "1h",
      limit: 3,
    });
    expect(res.success).toBe(true);
  });

  it("getTrendingNarratives", async () => {
    const res = await elfa.getTrendingNarratives({
      timeFrame: "day",
      maxNarratives: 2,
      maxTweetsPerNarrative: 2,
    });
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data.trending_narratives)).toBe(true);
  });

  it("getAccountSmartStats", async () => {
    const res = await elfa.getAccountSmartStats({ username: "cz_binance" });
    expect(res.success).toBe(true);
  });
});

describeLive("live: auto notification lifecycle", () => {
  const elfa = apiKey ? makeSdk() : (undefined as unknown as ElfaSDK);

  const input = {
    query: {
      conditions: {
        AND: [
          {
            source: "price" as const,
            method: "current",
            args: { symbol: "BTC", exchange: "hyperliquid" },
            operator: ">" as const,
            value: 9_999_999,
          },
        ],
      },
      actions: [
        {
          stepId: "step_1",
          type: "notify" as const,
          params: { message: "sdk it" },
        },
      ],
      expiresIn: "1h",
    },
    title: "sdk integration test",
  };

  it("validates a query", async () => {
    const res = await elfa.auto.validateQuery(input);
    expect(res.valid).toBe(true);
  });

  it("creates, polls, cancels and deletes a notification query", async () => {
    const created = await elfa.auto.createQuery(input);
    const id = created.id ?? created.queryId;
    expect(id).toBeDefined();

    const polled = await elfa.auto.getQuery(id as string);
    expect(polled.queryId).toBe(id);

    await elfa.auto.cancelQuery(id as string);
    await elfa.auto.deleteQuery(id as string);
  });
});
