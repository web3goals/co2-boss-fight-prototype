import axios from "axios";
import { NFTStorage } from "nft.storage";
import { ipfsUriToHttpUri } from "utils/converters";
import { Web3Storage } from "web3.storage";

/**
 * Hook for work with IPFS.
 */
export default function useIpfs() {
  const ipfsUriPrefix = "ipfs://";
  const web3Storage = new Web3Storage({
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY || "",
    endpoint: new URL("https://api.web3.storage"),
  });
  const nftstorage = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || "",
  });

  let uploadFileToIpfs = async function (file: any) {
    const cid = await web3Storage.put([file], { wrapWithDirectory: false });
    const uri = `${ipfsUriPrefix}${cid}`;
    return { cid, uri };
  };

  let uploadJsonToIpfs = async function (json: object) {
    const file = new File([JSON.stringify(json)], "", {
      type: "text/plain",
    });
    const cid = await web3Storage.put([file], { wrapWithDirectory: false });
    const uri = `${ipfsUriPrefix}${cid}`;
    return { cid, uri };
  };

  let uploadJsonToIpfsAlternative = async function (json: object) {
    const file = new File([JSON.stringify(json)], "", {
      type: "text/plain",
    });
    const cid = await nftstorage.storeBlob(file);
    const uri = `${ipfsUriPrefix}${cid}`;
    return { cid, uri };
  };

  let loadJsonFromIpfs = async function (uri: string) {
    const response = await axios.get(ipfsUriToHttpUri(uri));
    if (response.data.errors) {
      throw new Error(
        `Fail to loading json from IPFS: ${response.data.errors}`
      );
    }
    return response.data;
  };

  return {
    uploadFileToIpfs,
    uploadJsonToIpfs,
    uploadJsonToIpfsAlternative,
    loadJsonFromIpfs,
  };
}
