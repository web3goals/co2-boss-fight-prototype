import { BossFightRecord } from "@/types";
import { FGStorage } from "@co2-storage/js-api";

const authType = "metamask";
const ipfsNodeType = "client";
const ipfsNodeAddr =
  process.env.NODE_ENV == "production"
    ? "/dns4/web1.co2.storage/tcp/5002/https"
    : "/dns4/green.filecoin.space/tcp/5002/https";
// const ipfsNodeAddr = "/dns4/web2.co2.storage/tcp/5002/https";
const fgApiUrl =
  process.env.NODE_ENV == "production"
    ? "https://web1.co2.storage"
    : "https://green.filecoin.space";
// const fgApiUrl = "https://web2.co2.storage";

const fgStorage = new FGStorage({
  authType: authType,
  ipfsNodeType: ipfsNodeType,
  ipfsNodeAddr: ipfsNodeAddr,
  fgApiHost: fgApiUrl,
});

const chain = "CO2 Boss Fight";
const bossFightRecordTemplate =
  "bafyreieju4zt5nhxt6lgoxakpfu22lecxy5ingr4ecwa5sppcl5c5hsc7a";

export async function getBossFightRecords(
  boss: string
): Promise<BossFightRecord[] | undefined> {
  const records: BossFightRecord[] = [];
  const searchAssetsResponse = await fgStorage.searchAssets(chain);
  for (const asset of searchAssetsResponse?.result?.assets) {
    let getAssetResponse = await fgStorage.getAsset(asset.block);
    if (getAssetResponse.result) {
      const recordAccount = getAssetResponse.result.assetBlock
        .creator as `0x${string}`;
      const recordBoss = getAssetResponse.result.asset[0]["Boss ID"];
      const recordDate = Date.parse(
        getAssetResponse.result.assetBlock.timestamp
      );
      const recordDistance =
        getAssetResponse.result.asset[5]["Tracked Distance (km)"];
      const recordCO2 = getAssetResponse.result.asset[6]["Reduced CO2 (g)"];
      if (recordBoss === boss) {
        records.push({
          account: recordAccount,
          boss: recordBoss,
          date: recordDate,
          distance: recordDistance,
          co2: recordCO2,
        });
      }
    }
  }
  return records;
}

export async function saveBossFightRecord(
  bossId: string,
  bossImage: string,
  bossName: string,
  bossLocation: string,
  bossHealth: number,
  fighterAddress: `0x${string}`,
  fighterTrackedDistance: number,
  fighterReducedCO2: number
) {
  const assetElements = [
    {
      name: "Boss ID",
      value: bossId,
    },
    {
      name: "Boss Image",
      value: bossImage,
    },
    {
      name: "Boss Name",
      value: bossName,
    },
    {
      name: "Boss Location",
      value: bossLocation,
    },
    {
      name: "Boss Health (CO2 in g)",
      value: bossHealth,
    },
    {
      name: "Tracked Distance (km)",
      value: Number(fighterTrackedDistance.toFixed(2)),
    },
    {
      name: "Reduced CO2 (g)",
      value: Number(fighterReducedCO2.toFixed(2)),
    },
  ];
  await fgStorage.addAsset(
    assetElements,
    {
      parent: null,
      name: `Boss fight by ${fighterAddress}`,
      description: "",
      template: bossFightRecordTemplate,
      filesUploadStart: () => {
        console.log("Upload started");
      },
      filesUploadEnd: () => {
        console.log("Upload finished");
      },
      createAssetStart: () => {
        console.log("Creating asset");
      },
      createAssetEnd: () => {
        console.log("Asset created");
      },
    },
    chain,
    (status: any) => {
      console.log("Status", status);
    }
  );
}
