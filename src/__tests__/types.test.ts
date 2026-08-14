import type {
  ApiKeyStatus,
  MentionType,
  ProcessedMention,
  TopMentionV2,
} from "../types/elfa";

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

  it("narrows `billingMode` to the documented enum", () => {
    const status: Pick<ApiKeyStatus, "billingMode"> = {
      billingMode: "deposit",
    };

    const invalid: Pick<ApiKeyStatus, "billingMode"> = {
      // @ts-expect-error "invoice" is not in the schema's enum
      billingMode: "invoice",
    };

    expect([status.billingMode, invalid.billingMode]).toEqual([
      "deposit",
      "invoice",
    ]);
  });
});
