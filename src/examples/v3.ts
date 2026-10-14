import { ElfaSDK } from "../client/ElfaSDK.js";

export async function v3Example(): Promise<void> {
  const elfa = new ElfaSDK({
    elfaApiKey: "your-elfa-api-key",
  });

  const { entities } = await elfa.v3.getEntities({
    q: "btc",
    entityType: ["token"],
    limit: 1,
  });
  const bitcoin = entities[0];
  if (!bitcoin) return;
  console.log("Resolved:", bitcoin.name, bitcoin.id);

  const from = Math.floor(Date.now() / 1000) - 86400;
  const { events } = await elfa.v3.getEvents({
    entityIds: [bitcoin.id],
    from,
    limit: 10,
  });
  console.log(
    "Events:",
    events.map((event) => event.alertTitle),
  );

  const positioning = await elfa.v3.getPositioning({ entityId: bitcoin.id });
  console.log("Open long/short:", positioning.openLong, positioning.openShort);
}
