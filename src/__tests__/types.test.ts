import type {
  ApiKeyStatus,
  BillingMode,
  MentionType,
  ProcessedMention,
  TopMentionV2,
} from "../types/elfa";
import type {
  AutoCreateQueryResponse,
  AutoPollQueryResponse,
  AutoValidateResponse,
  EqlConditionSource,
  TradableExchange,
} from "../types/auto";
import type { EventsV3Params } from "../types/v3";

// Compile-time assertions. `@ts-expect-error` fails the build when the
// expression it guards stops being an error, so these are real checks: if a
// narrowing is reverted to `string`, the directive becomes unused and tsc
// fails.

describe("response types match swagger.json", () => {
  it("accepts every mention type the schema enumerates", () => {
    const types: MentionType[] = [
      "repost",
      "post",
      "quote",
      "reply",
      "note",
      "article",
    ];
    expect(types).toEqual([
      "repost",
      "post",
      "quote",
      "reply",
      "note",
      "article",
    ]);
  });

  it("rejects a mention type the schema does not enumerate", () => {
    // @ts-expect-error "tweet" is not in the schema's enum
    const invalid: MentionType = "tweet";
    expect(invalid).toBe("tweet");
  });

  it("narrows `type` on both mention shapes", () => {
    const mention: Pick<ProcessedMention, "type"> = { type: "quote" };
    const top: Pick<TopMentionV2, "type"> = { type: "article" };

    // @ts-expect-error `type` is no longer a plain string
    const loose: Pick<ProcessedMention, "type"> = { type: "whatever" };

    expect([mention.type, top.type, loose.type]).toEqual([
      "quote",
      "article",
      "whatever",
    ]);
  });

  it("narrows `billingMode` to the documented enum", () => {
    const deposit: Pick<ApiKeyStatus, "billingMode"> = {
      billingMode: "deposit",
    };
    const arrears: Pick<ApiKeyStatus, "billingMode"> = {
      billingMode: "arrears",
    };

    const invalid: Pick<ApiKeyStatus, "billingMode"> = {
      // @ts-expect-error "invoice" is not in the schema's enum
      billingMode: "invoice",
    };
    const alsoInvalid: Pick<ApiKeyStatus, "billingMode"> = {
      // @ts-expect-error an arbitrary string is not in the schema's enum
      billingMode: "prepaid",
    };

    expect([
      deposit.billingMode,
      arrears.billingMode,
      invalid.billingMode,
      alsoInvalid.billingMode,
    ]).toEqual(["deposit", "arrears", "invoice", "prepaid"]);
  });

  it("exposes BillingMode as its own type", () => {
    const modes: BillingMode[] = ["deposit", "arrears"];
    expect(modes).toEqual(["deposit", "arrears"]);
  });

  it("limits TradableExchange to the validate-symbol enum", () => {
    const exchanges: TradableExchange[] = ["hyperliquid", "binance"];

    // @ts-expect-error "gmx" was removed from the schema's enum
    const gmx: TradableExchange = "gmx";

    expect([...exchanges, gmx]).toEqual(["hyperliquid", "binance", "gmx"]);
  });

  it("covers the documented condition sources", () => {
    const sources: EqlConditionSource[] = [
      "events",
      "x_follow_received",
      "x_follow_made",
      "x_follow_overlap",
    ];

    expect(sources).toHaveLength(4);
  });

  it("keeps spam out of the events filter, which the API refuses", () => {
    const ok: EventsV3Params = { eventType: "listing" };

    // @ts-expect-error eventType=spam is a 400
    const spam: EventsV3Params = { eventType: "spam" };

    expect([ok.eventType, spam.eventType]).toEqual(["listing", "spam"]);
  });
});

describe("auto response types match swagger.json", () => {
  it("types the X accounts validate returns", () => {
    const response: AutoValidateResponse = {
      valid: true,
      errors: [],
      warnings: [],
      estimatedCredits: null,
      tweetAccounts: [
        {
          path: "conditions.OR[1]",
          username: "nasa",
          accountSourceRefId: "11348282",
          billing: "per_post",
          creditsPerPost: 1,
        },
      ],
    };
    expect(response.tweetAccounts?.[0]?.billing).toBe("per_post");
  });

  it("rejects a billing value the schema does not enumerate", () => {
    const account: NonNullable<AutoValidateResponse["tweetAccounts"]>[number] =
      {
        path: "conditions.OR[0]",
        username: "nasa",
        accountSourceRefId: "11348282",
        // @ts-expect-error "free" is not in the schema's billing enum
        billing: "free",
      };
    expect(account.billing).toBe("free");
  });

  it("no longer types estimatedCost on validate", () => {
    const response: AutoValidateResponse = {
      valid: true,
      errors: [],
      warnings: [],
      // @ts-expect-error estimatedCost is x402-only, not on the API-key response
      estimatedCost: { credits: 1, price: "$0.01" },
    };
    expect(response.valid).toBe(true);
  });

  it("requires the id create returns", () => {
    // @ts-expect-error create always returns id
    const noId: AutoCreateQueryResponse = { status: "active" };
    expect(noId.status).toBe("active");
  });

  it("requires the status create returns", () => {
    // @ts-expect-error create always returns status
    const noStatus: AutoCreateQueryResponse = { id: "q" };
    expect(noStatus.id).toBe("q");
  });

  it("types the failure poll returns", () => {
    const poll: AutoPollQueryResponse = {
      queryId: "q",
      status: "failed",
      latestEvaluation: null,
      executions: [],
      failure: {
        code: "SUBSCRIPTION_CREDITS_EXHAUSTED",
        message: null,
        source: "billing",
      },
    };
    expect(poll.failure?.source).toBe("billing");
  });
});
