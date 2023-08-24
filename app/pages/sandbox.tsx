import { FGStorage } from "@co2-storage/js-api";

export default function Sandbox() {
  async function playWithCO2Storage() {
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

    const chain = "decarbonize.travel";
    const template =
      "bafyreieavkw3aoidtedsewyzjzzl55wvqqbsbrvyx2szc5i75qwgwuhhsy";

    let getTemplateResponse = await fgStorage.getTemplate(template);
    console.log("getTemplateResponse", getTemplateResponse);

    const assetElements = [
      {
        name: "Attendee Name",
        value: "Arthur",
      },
      {
        name: "Event",
        value: "Fund Public Goods Hackathon",
      },
      {
        name: "Start Date",
        value: "2023-08-11T20:00:00.000Z",
      },
      {
        name: "End Date",
        value: "2023-08-31T20:00:00.000Z",
      },
      {
        name: "Travel Description",
        value: "Travel to Hackathon",
      },
      {
        name: "One-way Driving Distance (miles)",
        value: 15,
      },
      {
        name: "One-way Flying Distance (miles)",
        value: 500,
      },
      {
        name: "Offset Chain",
        value: "regen-1",
      },
      {
        name: "Offset Amount (kg CO2e)",
        value: 1000,
      },
      {
        name: "Emissions Description",
        value: "Travel decarbonization for Arthur",
      },
      {
        name: "Offset Transaction Hash",
        value:
          "A0E42D77DE42A175D1E040FE05388C7AFEC9CAB066CE38D32BF6B7FA08647B11",
      },
    ];
    const addAssetResponse = await fgStorage.addAsset(
      assetElements,
      {
        parent: null,
        name: "Travel decarbonization for Arthur",
        description: "",
        template: template,
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
    console.log("addAssetResponse", addAssetResponse);
  }

  return (
    <div style={{ margin: "24px" }}>
      <h1>Welcome to sandbox!</h1>
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => playWithCO2Storage()}>Test</button>
      </div>
    </div>
  );
}
