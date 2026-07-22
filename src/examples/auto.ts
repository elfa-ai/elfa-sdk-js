import { ElfaSDK } from "../client/ElfaSDK.js";
import type { AutoQueryInput } from "../types/auto.js";

export async function autoAndTradeExample(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: "your-elfa-api-key",
    hmacSecret: "your-hmac-secret",
  });

  const input: AutoQueryInput = {
    query: {
      conditions: {
        AND: [
          {
            source: "price",
            method: "current",
            args: { symbol: "BTC", exchange: "hyperliquid" },
            operator: ">",
            value: 100000,
          },
        ],
      },
      actions: [
        {
          stepId: "step_1",
          type: "notify",
          params: { message: "BTC crossed 100k" },
        },
      ],
      expiresIn: "24h",
    },
    title: "BTC breakout alert",
  };

  const validation = await elfa.auto.validateQuery(input);
  console.log("Query valid:", validation.valid);

  const created = await elfa.auto.createQuery(input);
  const queryId = created.id ?? created.queryId;
  console.log("Created query:", queryId);

  const status = await elfa.auto.getQuery(queryId as string);
  console.log("Status:", status.status);

  const orderPreview = await elfa.trade.previewOrder({
    exchange: "hyperliquid",
    symbol: "BTC",
    side: "buy",
    orderType: "market",
    amount: "100",
  });
  console.log("Order would execute:", orderPreview.wouldExecute);
}
