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

const chain = "CO2 Boss Fight";
const bossFightRecordTemplate =
  "bafyreieju4zt5nhxt6lgoxakpfu22lecxy5ingr4ecwa5sppcl5c5hsc7a";

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
  const fgStorage = new FGStorage({
    authType: authType,
    ipfsNodeType: ipfsNodeType,
    ipfsNodeAddr: ipfsNodeAddr,
    fgApiHost: fgApiUrl,
  });
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
      console.log("status", status);
    }
  );
}
