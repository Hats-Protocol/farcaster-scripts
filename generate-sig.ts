import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
  hashTypedData,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import {
  ID_REGISTRY_ADDRESS,
  idRegistryABI,
  ID_REGISTRY_EIP_712_TYPES,
} from "@farcaster/hub-web";
import { optimism } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: optimism,
    transport: http(),
  });

  const account = mnemonicToAccount(process.env.MNEMONIC as `0x${string}`);

  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60 * 12;
  const deadline = now + oneHour;

  const nonce = await publicClient.readContract({
    address: ID_REGISTRY_ADDRESS,
    abi: idRegistryABI,
    functionName: "nonces",
    args: [account.address],
  });

  const hash = hashTypedData({
    ...ID_REGISTRY_EIP_712_TYPES,
    primaryType: "Transfer",
    message: {
      fid: BigInt(process.env.FID as string),
      to: account.address,
      nonce,
      deadline: BigInt(deadline),
    },
  });

  const signature = await walletClient.signTypedData({
    account,
    ...ID_REGISTRY_EIP_712_TYPES,
    primaryType: "Transfer",
    message: {
      fid: BigInt(process.env.FID as string),
      to: account.address,
      nonce,
      deadline: BigInt(deadline),
    },
  });

  console.log("deadline:\n", deadline);
  console.log("signature:\n", signature);
};

main();
