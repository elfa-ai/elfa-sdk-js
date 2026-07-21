import { TradeClient } from "../client/TradeClient";
import { HttpClient } from "../utils/http";

jest.mock("../utils/http");

describe("TradeClient", () => {
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      setAuthHeader: jest.fn(),
    } as any;
    (HttpClient as jest.MockedClass<typeof HttpClient>).mockImplementation(
      () => mockHttpClient,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const order = {
    exchange: "hyperliquid" as const,
    symbol: "BTC",
    side: "buy" as const,
    orderType: "market" as const,
    amount: "100",
  };

  it("previews an order unsigned", async () => {
    const client = new TradeClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({
      success: true,
      wouldExecute: true,
    });

    await client.previewOrder(order);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/trade/orders/preview",
      JSON.stringify(order),
      undefined,
    );
  });

  it("signs placeOrder when hmacSecret is set", async () => {
    const client = new TradeClient({ apiKey: "k", hmacSecret: "secret" });
    mockHttpClient.post.mockResolvedValue({ success: true });

    await client.placeOrder(order);

    const [url, body, config] = mockHttpClient.post.mock.calls[0];
    expect(url).toBe("/v2/trade/orders");
    expect(body).toBe(JSON.stringify(order));
    expect(config?.headers).toEqual(
      expect.objectContaining({
        "x-elfa-timestamp": expect.any(String),
        "x-elfa-signature": expect.any(String),
      }),
    );
  });

  it("closes a position", async () => {
    const client = new TradeClient({ apiKey: "k" });
    mockHttpClient.post.mockResolvedValue({ success: true });

    const input = {
      exchange: "gmx" as const,
      symbol: "ETH",
      orderType: "market" as const,
      positionSizePercent: 50,
    };
    await client.closePosition(input);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/v2/trade/positions/close",
      JSON.stringify(input),
      undefined,
    );
  });
});
