import type {
  ApiKeyStatus,
  MentionType,
  ProcessedMention,
  TopMentionV2,
} from "../types/elfa";

// Compile-time assertions. `@ts-expect-error` fails the build when the
// expression it guards stops being an error, so these are real checks.

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
    expect(types).toHaveLength(6);
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

  it("exposes the key-status fields the schema documents", () => {
    const status: Partial<ApiKeyStatus> = {
      key: "elfa_...",
      requestsPerMinute: 60,
      updatedAt: "2026-01-01T00:00:00.000Z",
      email: "dev@example.com",
      project: "example",
      tier: "free",
      billingMode: "deposit",
      depositCredits: 0,
      allowOverage: false,
      maxOverage: 0,
    };

    expect(Object.keys(status)).toHaveLength(10);
  });

  it("narrows `billingMode` to the documented enum", () => {
    // @ts-expect-error "invoice" is not in the schema's enum
    const status: Partial<ApiKeyStatus> = { billingMode: "invoice" };
    expect(status.billingMode).toBe("invoice");
  });
});
