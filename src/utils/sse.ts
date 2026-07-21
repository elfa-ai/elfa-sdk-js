export interface SSEMessage {
  event?: string;
  data: string;
  id?: string;
}

export async function* readSSE(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SSEMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let match: RegExpMatchArray | null;
      while ((match = buffer.match(/\r?\n\r?\n/))) {
        const index = match.index!;
        const frame = buffer.slice(0, index);
        buffer = buffer.slice(index + match[0].length);
        const message = parseFrame(frame);
        if (message) yield message;
      }
    }

    const message = parseFrame(buffer);
    if (message) yield message;
  } finally {
    reader.releaseLock();
  }
}

function parseFrame(frame: string): SSEMessage | null {
  let event: string | undefined;
  let id: string | undefined;
  const data: string[] = [];

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("id:")) id = line.slice(3).trim();
    else if (line.startsWith("data:"))
      data.push(line.slice(5).replace(/^ /, ""));
  }

  if (data.length === 0 && event === undefined) return null;
  return { event, id, data: data.join("\n") };
}
