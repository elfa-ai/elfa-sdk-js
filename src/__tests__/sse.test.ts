import { readSSE, type SSEMessage } from "../utils/sse";

function streamFrom(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(chunks: string[]): Promise<SSEMessage[]> {
  const out: SSEMessage[] = [];
  for await (const message of readSSE(streamFrom(chunks))) out.push(message);
  return out;
}

describe("readSSE", () => {
  it("parses event, id and data fields", async () => {
    const messages = await collect([
      'id: 1\nevent: notification\ndata: {"a":1}\n\n',
    ]);
    expect(messages).toEqual([
      { id: "1", event: "notification", data: '{"a":1}' },
    ]);
  });

  it("parses a data-only frame with no event", async () => {
    const messages = await collect(['data: {"x":true}\n\n']);
    expect(messages).toEqual([{ event: undefined, data: '{"x":true}' }]);
  });

  it("ignores keep-alive comment lines", async () => {
    const messages = await collect([": keep-alive\n\n", "data: ok\n\n"]);
    expect(messages).toEqual([{ event: undefined, data: "ok" }]);
  });

  it("joins multi-line data with newlines", async () => {
    const messages = await collect(["data: line1\ndata: line2\n\n"]);
    expect(messages[0].data).toBe("line1\nline2");
  });

  it("handles frames split across chunks", async () => {
    const messages = await collect(["event: end\nda", 'ta: {"code":1}\n\n']);
    expect(messages).toEqual([{ event: "end", data: '{"code":1}' }]);
  });

  it("releases the reader lock when the consumer stops early", async () => {
    const body = streamFrom(["data: a\n\n", "data: b\n\n"]);
    for await (const _ of readSSE(body)) {
      break;
    }
    expect(() => body.getReader()).not.toThrow();
  });
});
