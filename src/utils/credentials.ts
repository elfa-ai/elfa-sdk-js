/**
 * How a client authenticates: an API key (`x-elfa-api-key`) or an OAuth
 * access token (`Authorization: Bearer`). Exactly one is set.
 */
export interface Credentials {
  apiKey?: string;
  accessToken?: string;
}

/** The request header(s) for a credential. */
export function authHeaders(credentials: Credentials): Record<string, string> {
  return credentials.accessToken
    ? { Authorization: `Bearer ${credentials.accessToken}` }
    : { "x-elfa-api-key": credentials.apiKey ?? "" };
}
