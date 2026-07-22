import { createHmac } from "crypto";

export function signRequest(
  secret: string,
  method: string,
  mountedPath: string,
  body: string,
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${timestamp}${method}${mountedPath}${body}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return { "x-elfa-timestamp": timestamp, "x-elfa-signature": signature };
}
