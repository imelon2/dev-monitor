import { Address, defineChain, Hex } from 'viem';
import { mainnet, sepolia, holesky, arbitrum, arbitrumNova, arbitrumSepolia } from 'viem/chains';

const supportedChains = {
  mainnet,
  sepolia,
  holesky,
  arbitrum,
  arbitrumNova,
  arbitrumSepolia,
};

export const getChainInfoFromChainId = (chainId: number) => {
  for (const chain of Object.values(supportedChains)) {
    if ('id' in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  return undefined;
};

export const defineDkargoChainInformation = (chainId: number, chainRpc: string) => {
  return defineChain({
    id: chainId,
    name: 'Dkargo Chain',
    network: 'Dkargo',
    nativeCurrency: {
      name: 'dkargo',
      symbol: 'DKA',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [chainRpc],
      },
      public: {
        http: [chainRpc],
      },
    },
  });
};

export const defineDaCertBatchPostingInfo = (
  txHash: Hex,
  blockNumber: bigint,
  timestamp:bigint,
  batchPoster: Address,
  args: any,
  cert: any,
) => {
  return {
    isDaCert: true,
    transactionHash: txHash,
    timestamp,
    blockNumber,
    batchPoster,
    args,
    cert,
  };
};

export const defineBatchPostingInfo = (
    txHash: Hex,
    blockNumber: bigint,
    timestamp:bigint,
    batchPoster: Address,
    args: any,
) => {
  return {
    isDaCert: false,
    transactionHash: txHash,
    timestamp,
    blockNumber,
    batchPoster,
    args,
  };
};

// Block range to search for recent events (24 hours)
const blockCountToSearchRecentEventsOnArb = BigInt((24 * 60 * 60) / 0.25); // 345600

// The default RPC for Ethereum on Viem has a restriction of 800 blocks max
// (this can be solved by defining a custom RPC in the .env file)
// const defaultBlockCountToSearchRecentEventsOnEth = 800n;

export const getBlockToSearchEventsFrom = (toBlock: bigint) => {
  return toBlock - blockCountToSearchRecentEventsOnArb;
};

export const getProgressPercentage = (totalCount: number, collectedCount: number): number => {
  if (totalCount === 0) return 0;
  return (collectedCount / totalCount) * 100;
};

export function removeHexPrefix(hex: Hex) {
  if (hex.startsWith('0x')) {
    return hex.slice(2);
  }
  return hex;
}

const DACERT_HEADER = '0x88';
export const isDaCert = (calldata: Hex) => {
  const header = calldata.slice(0, 4);
  if (header == DACERT_HEADER) {
    return true;
  }
  return false;
};

export const serializeDaCert = (data: Hex) => {
  const pure = removeHexPrefix(data);
  return {
    header: pure.slice(0, 2),
    keysetHash: pure.slice(2, 66),
    dataHash: pure.slice(66, 130),
    timeout: pure.slice(130, 146),
    version: pure.slice(146, 148),
    sigenrMask: pure.slice(148, 164),
    aggregateSig: pure.slice(164),
  };
};

export function shortenAddress(address:Address) {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}....${address.slice(-4)}`;
  }